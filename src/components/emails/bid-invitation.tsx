import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';

interface BidInvitationEmailProps {
  bidId: string;
  vendorId: string;
  bidTitle: string;
  dueDate: Date;
  buyerName: string;
  companyName: string;
  bidDescription?: string;
  itemCount: number;
  baseUrl: string;
}

export const BidInvitationEmail = ({
  bidId,
  vendorId,
  bidTitle,
  dueDate,
  buyerName,
  companyName,
  bidDescription,
  itemCount,
  baseUrl = 'http://localhost:3000',
}: BidInvitationEmailProps) => {
  const previewText = `You've been invited to submit a bid for ${bidTitle}`;
  const formattedDueDate = format(new Date(dueDate), 'PPP');
  const bidLink = `${baseUrl}/vendor/${bidId}?vendorId=${vendorId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={header}>ProcureBid Invitation</Heading>
          <Section style={section}>
            <Text style={text}>Hello,</Text>
            <Text style={text}>
              You have been invited by <strong>{buyerName}</strong> from <strong>{companyName}</strong> to submit a bid for the following procurement request:
            </Text>
            
            <Section style={bidDetails}>
              <Heading as="h2" style={bidTitleStyle}>
                {bidTitle}
              </Heading>
              {bidDescription && (
                <Text style={text}>{bidDescription}</Text>
              )}
              <Text style={infoText}>
                <strong>Item Count:</strong> {itemCount} items
              </Text>
              <Text style={infoText}>
                <strong>Due Date:</strong> {formattedDueDate}
              </Text>
            </Section>
            
            <Text style={text}>
              Please click the button below to view and respond to the bid request. Your timely response is appreciated.
            </Text>
            
            <Button
              href={bidLink}
              style={button}
            >
              View Bid Request
            </Button>
            
            <Text style={text}>
              If the button above doesn't work, you can copy and paste the following URL into your browser:
            </Text>
            <Text style={codeText}>
              {bidLink}
            </Text>
            
            <Hr style={hr} />
            
            <Text style={footerText}>
              This is an automated message from the ProcureBid platform. Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BidInvitationEmail;

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

const bidDetails = {
  padding: '16px',
  backgroundColor: '#f7f9fc',
  borderRadius: '6px',
  marginBottom: '16px',
};

const bidTitleStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0',
  color: '#333',
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
  backgroundColor: '#2563eb',
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
