import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';

interface BidReminderEmailProps {
  bidId: string;
  vendorId: string;
  bidTitle: string;
  dueDate: Date;
  buyerName: string;
  companyName: string;
  daysRemaining: number;
  baseUrl: string;
}

export const BidReminderEmail = ({
  bidId,
  vendorId,
  bidTitle,
  dueDate,
  buyerName,
  companyName,
  daysRemaining,
  baseUrl = 'http://localhost:3000',
}: BidReminderEmailProps) => {
  const previewText = `REMINDER: Your bid response for ${bidTitle} is due soon`;
  const formattedDueDate = format(new Date(dueDate), 'PPP');
  const bidLink = `${baseUrl}/vendor/${bidId}?vendorId=${vendorId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={header}>Bid Response Reminder</Heading>
          <Section style={section}>
            <Text style={reminderBadge}>
              {daysRemaining <= 1 ? 'URGENT: DUE TOMORROW' : `REMINDER: ${daysRemaining} DAYS REMAINING`}
            </Text>
            
            <Text style={text}>Hello,</Text>
            <Text style={text}>
              This is a friendly reminder that you have been invited by <strong>{buyerName}</strong> from <strong>{companyName}</strong> to submit a bid for:
            </Text>
            
            <Section style={bidDetails}>
              <Heading as="h2" style={bidTitle}>
                {bidTitle}
              </Heading>
              <Text style={infoText}>
                <strong>Due Date:</strong> {formattedDueDate} ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining)
              </Text>
            </Section>
            
            <Text style={text}>
              We have not yet received your response. Please click the button below to view and respond to the bid request before the deadline.
            </Text>
            
            <Button
              href={bidLink}
              style={button}
            >
              Submit Your Bid Now
            </Button>
            
            <Text style={text}>
              If the button above doesn't work, you can copy and paste the following URL into your browser:
            </Text>
            <Text style={codeText}>
              {bidLink}
            </Text>
            
            <Hr style={hr} />
            
            <Text style={footerText}>
              If you've already submitted your response, please disregard this message. Thank you for your participation.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BidReminderEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  fontSize: '24px',
  color: '#333',
  textAlign: 'center' as const,
  padding: '20px 0',
};

const section = {
  padding: '24px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const reminderBadge = {
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '14px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const bidDetails = {
  padding: '16px',
  backgroundColor: '#f7f9fc',
  borderRadius: '6px',
  marginBottom: '16px',
};

const bidTitle = {
  fontSize: '18px',
  color: '#1a56db',
  marginBottom: '8px',
};

const text = {
  fontSize: '16px',
  color: '#404040',
  lineHeight: '24px',
  marginBottom: '16px',
};

const infoText = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '20px',
  marginBottom: '8px',
};

const button = {
  backgroundColor: '#b91c1c',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  marginTop: '24px',
  marginBottom: '24px',
};

const codeText = {
  fontSize: '14px',
  backgroundColor: '#f1f5f9',
  padding: '12px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  color: '#334155',
  wordBreak: 'break-all' as const,
  marginBottom: '24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '20px',
  textAlign: 'center' as const,
};
