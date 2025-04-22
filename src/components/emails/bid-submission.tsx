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

interface BidSubmissionEmailProps {
  bidId: string;
  bidTitle: string;
  vendorName: string;
  submissionDate: Date;
  itemCount: number;
  hasHeaderInfo: boolean;
  buyerName: string;
  baseUrl: string;
}

export const BidSubmissionEmail = ({
  bidId,
  bidTitle,
  vendorName,
  submissionDate,
  itemCount,
  hasHeaderInfo,
  buyerName,
  baseUrl = 'http://localhost:3000',
}: BidSubmissionEmailProps) => {
  const previewText = `${vendorName} has submitted a bid response for ${bidTitle}`;
  const formattedSubmissionDate = format(new Date(submissionDate), 'PPP');
  const formattedSubmissionTime = format(new Date(submissionDate), 'p');
  const comparisonLink = `${baseUrl}/dashboard/comparison/${bidId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={header}>Bid Response Received</Heading>
          <Section style={section}>
            <Text style={successBadge}>NEW SUBMISSION</Text>
            
            <Text style={text}>Hello {buyerName},</Text>
            <Text style={text}>
              <strong>{vendorName}</strong> has submitted a response to your bid request:
            </Text>
            
            <Section style={bidDetails}>
              <Heading as="h2" style={bidTitle}>
                {bidTitle}
              </Heading>
              <Text style={infoText}>
                <strong>Submitted on:</strong> {formattedSubmissionDate} at {formattedSubmissionTime}
              </Text>
              <Text style={infoText}>
                <strong>Submission details:</strong>
              </Text>
              <ul style={listStyle}>
                <li style={listItem}>Responded to {itemCount} items</li>
                {hasHeaderInfo && (
                  <li style={listItem}>Included header-level information (payment terms, incoterms, etc.)</li>
                )}
              </ul>
            </Section>
            
            <Text style={text}>
              You can now view and compare this submission with other vendor responses.
            </Text>
            
            <Button
              href={comparisonLink}
              style={button}
            >
              View Comparison Table
            </Button>
            
            <Text style={text}>
              If the button above doesn't work, you can copy and paste the following URL into your browser:
            </Text>
            <Text style={codeText}>
              {comparisonLink}
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

export default BidSubmissionEmail;

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

const successBadge = {
  backgroundColor: '#ecfdf5',
  color: '#047857',
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

const listStyle = {
  margin: '0 0 16px 0',
  padding: '0 0 0 20px',
};

const listItem = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '20px',
  marginBottom: '4px',
};

const button = {
  backgroundColor: '#047857',
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
