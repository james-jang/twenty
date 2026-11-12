import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';

export const COMMUNITY_EMAILING_DOMAIN_DRIVERS = [
  EmailingDomainDriver.AWS_SES,
  EmailingDomainDriver.RESEND,
  EmailingDomainDriver.LOG,
];
