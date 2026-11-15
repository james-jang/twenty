import { generateKeyPairSync } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

describe('JwtWrapperService (ES256-only verification)', () => {
  const getValidPublicKeyPemById = jest.fn();
  const service = new JwtWrapperService(
    { decode: jwt.decode } as never,
    { get: () => 'app-secret' } as never,
    { getValidPublicKeyPemById } as unknown as JwtKeyManagerService,
    { recordKidVerify: jest.fn(), recordLegacyVerify: jest.fn() } as never,
  );

  const payload = { sub: 'user-1', userId: 'user-1', workspaceId: 'ws-1' };

  beforeEach(() => getValidPublicKeyPemById.mockReset());

  it('rejects a legacy HS256 token without a kid', async () => {
    const token = jwt.sign(payload, 'any-secret', { algorithm: 'HS256' });

    await expect(service.verifyJwtToken(token)).rejects.toMatchObject({
      code: AuthExceptionCode.UNAUTHENTICATED,
    });
    expect(getValidPublicKeyPemById).not.toHaveBeenCalled();
  });

  it('rejects an HS256 token that carries a kid', async () => {
    const token = jwt.sign(payload, 'any-secret', {
      algorithm: 'HS256',
      keyid: 'kid-1',
    });

    await expect(service.resolveVerificationKey(token)).rejects.toMatchObject({
      code: AuthExceptionCode.UNAUTHENTICATED,
    });
  });

  it('rejects an ES256 token whose kid is unknown', async () => {
    getValidPublicKeyPemById.mockResolvedValue(null);
    const { privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
    });
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: 'unknown',
    });

    await expect(service.verifyJwtToken(token)).rejects.toMatchObject({
      code: AuthExceptionCode.UNAUTHENTICATED,
    });
  });

  it('accepts an ES256 token with a known kid', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
    });

    getValidPublicKeyPemById.mockResolvedValue(
      publicKey.export({ type: 'spki', format: 'pem' }),
    );
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: 'kid-1',
    });

    await expect(service.verifyJwtToken(token)).resolves.toMatchObject(payload);
  });
});
