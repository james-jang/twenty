import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceDataExportService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export.service';

describe('WorkspaceDataExportService (allowImpersonation gate)', () => {
  const findOne = jest.fn();
  const fileFind = jest.fn().mockResolvedValue([]);
  const service = new WorkspaceDataExportService(
    { findOne } as never,
    { find: fileFind } as never,
    ...(new Array(8).fill({}) as [
      never,
      never,
      never,
      never,
      never,
      never,
      never,
      never,
    ]),
  );

  beforeEach(() => fileFind.mockClear());

  it.each([
    ['findMany', () => service.findMany('ws-1')],
    [
      'create',
      () => service.create({ workspaceId: 'ws-1', actorUserId: 'u-1' }),
    ],
  ])(
    '%s refuses a workspace with allowImpersonation=false',
    async (_n, call) => {
      findOne.mockResolvedValue({ id: 'ws-1', allowImpersonation: false });

      await expect(call()).rejects.toBeInstanceOf(ForbiddenError);
      expect(fileFind).not.toHaveBeenCalled();
    },
  );

  it('findMany proceeds for a workspace with allowImpersonation=true', async () => {
    findOne.mockResolvedValue({ id: 'ws-1', allowImpersonation: true });

    await expect(service.findMany('ws-1')).resolves.toEqual([]);
  });
});
