import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';

describe('SignInUpService (ALLOW_REQUESTS_TO_TWENTY_ICONS gate on workspace creation)', () => {
  const buildService = (allowRequestsToTwentyIcons: boolean) => {
    const uploadWorkspaceLogoFromUrl = jest.fn().mockResolvedValue(undefined);

    const workspace = { id: 'ws-1', displayName: 'Acme', logoFileId: null };
    const user = { id: 'u-1', email: 'owner@acme-clinic.ca' };

    const deps = {
      userRepository: { count: jest.fn().mockResolvedValue(1) },
      workspaceRepository: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockReturnValue(workspace),
      },
      workspaceInvitationService: {},
      userWorkspaceService: {},
      onboardingService: {},
      workspaceEventEmitter: {},
      twentyConfigService: {
        get: jest.fn((key: string) => {
          if (key === 'ALLOW_REQUESTS_TO_TWENTY_ICONS') {
            return allowRequestsToTwentyIcons;
          }

          return true;
        }),
      },
      subdomainManagerService: {
        generateSubdomain: jest.fn().mockResolvedValue('acme'),
      },
      userService: {},
      metricsService: {},
      workspaceCacheService: {
        invalidateAndRecompute: jest.fn().mockResolvedValue(undefined),
      },
      applicationService: {},
      fileCorePictureService: { uploadWorkspaceLogoFromUrl },
      fileStorageService: {},
      exceptionHandlerService: {},
      enterprisePlanService: {},
      eventLogEmitterService: {
        createContext: jest.fn().mockReturnValue({
          insertWorkspaceEvent: jest.fn().mockResolvedValue(undefined),
        }),
      },
      billingService: { isBillingEnabled: jest.fn().mockReturnValue(false) },
      billingSeatService: {},
      dataSource: {
        transaction: jest.fn().mockResolvedValue({
          user,
          workspace,
          customApplicationUniversalIdentifier: 'app-uid',
        }),
      },
    };

    const service = new SignInUpService(
      ...(Object.values(deps) as ConstructorParameters<
        typeof SignInUpService
      >),
    );

    return { service, user, uploadWorkspaceLogoFromUrl };
  };

  it('does not fetch the inferred logo when ALLOW_REQUESTS_TO_TWENTY_ICONS is false', async () => {
    const { service, user, uploadWorkspaceLogoFromUrl } = buildService(false);

    await service.signUpOnNewWorkspace(
      { type: 'existingUser', existingUser: user } as never,
      { displayName: 'Acme' },
    );

    expect(uploadWorkspaceLogoFromUrl).not.toHaveBeenCalled();
  });

  it('fetches the inferred logo when ALLOW_REQUESTS_TO_TWENTY_ICONS is true (upstream behaviour)', async () => {
    const { service, user, uploadWorkspaceLogoFromUrl } = buildService(true);

    await service.signUpOnNewWorkspace(
      { type: 'existingUser', existingUser: user } as never,
      { displayName: 'Acme' },
    );

    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledTimes(1);
    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: expect.stringContaining('acme-clinic.ca'),
        workspaceId: expect.any(String),
        applicationUniversalIdentifier: 'app-uid',
      }),
    );
  });
});
