import { today } from '../utils/date-helper';

export interface TicketFormData {
  reporterName: string;
  sourceType: 'Email' | 'Portal' | 'PDF Upload';
  incidentDate: string;
  description: string;
  attachmentFilename?: string;
}

export const lowPriorityTicket: TicketFormData = {
  reporterName: 'Jane Smith',
  sourceType: 'Email',
  incidentDate: today(),
  description: 'Minor UI glitch on the settings page today',
};

export const criticalSystemDownTicket: TicketFormData = {
  reporterName: 'Critical User',
  sourceType: 'Portal',
  incidentDate: today(),
  description: 'The system down affected all users in production',
};

export const criticalSecurityDownTicket: TicketFormData = {
  reporterName: 'Security Analyst',
  sourceType: 'Email',
  incidentDate: today(),
  description: 'We have a security down on the main firewall',
};

export const criticalError500Ticket: TicketFormData = {
  reporterName: 'API Monitor',
  sourceType: 'PDF Upload',
  incidentDate: today(),
  description: 'Users see error 500 on the login page repeatedly',
};

export const invalidApiTicket = {
  reporter_name: 'Missing Fields',
  source_type: 'Email',
  incident_date: today(),
};
