import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface FeedbackEmailRequest {
  userId: string;
  reasonText: string;
  feedbackText: string;
  photoUrls: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackEmailRequest = await request.json();
    const { userId, reasonText, feedbackText, photoUrls } = body;

    // Build photo links HTML
    const photoLinksHtml = photoUrls.length > 0
      ? `
        <h3>Attached Photos:</h3>
        <ul>
          ${photoUrls.map((url, i) => `<li><a href="${url}">Photo ${i + 1}</a></li>`).join('')}
        </ul>
      `
      : '<p>No photos attached</p>';

    // Build email HTML
    const emailHtml = `
      <h2>Account Deletion Feedback</h2>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Reason:</strong> ${reasonText}</p>
      <h3>Feedback Message:</h3>
      <p>${feedbackText || 'No message provided'}</p>
      ${photoLinksHtml}
      <hr>
      <p style="color: #666; font-size: 12px;">
        This email was sent automatically from DreamAI account deletion flow.
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'DreamAI <noreply@akmldsfmasdfmma.space>',
      to: ['posteopost@posteo.de'],
      subject: `Account Deletion Feedback - ${reasonText}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Error sending feedback email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
