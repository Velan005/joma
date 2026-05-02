import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"Joma" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your login code for Joma",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.05em;">Your login code</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 32px;">
          Enter this code to sign in to your Joma account. It expires in 10 minutes.
        </p>
        <div style="background: #f4f4f4; border-radius: 4px; padding: 24px; text-align: center; letter-spacing: 0.4em; font-size: 36px; font-weight: 700; font-family: monospace; color: #111;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

function buildOrderItemsTable(products: any[]): string {
  const rows = products
    .map(
      (item: any) => `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px;">${item.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #555;">${item.size || "—"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; color: #555;">${item.color || "—"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="background: #f9f9f9;">
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #666;">Product</th>
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #666;">Size</th>
          <th style="padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #666;">Colour</th>
          <th style="padding: 10px 12px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #666;">Qty</th>
          <th style="padding: 10px 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #666;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export async function sendAdminOrderNotification(order: any): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const customer = order.customer || {};
  const address = customer.address || {};
  const items = order.products?.length ? order.products : order.items || [];
  const orderId = order._id?.toString() || "N/A";
  const dashboardUrl = `${process.env.NEXTAUTH_URL || "https://joma-studio.in"}/dashboard/orders/${orderId}`;

  await transporter.sendMail({
    from: `"Joma Store" <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: `🛍️ New Order #${orderId} — ₹${order.totalAmount?.toLocaleString()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: #111; padding: 24px 32px;">
          <span style="color: #fff; font-size: 20px; font-weight: 700; letter-spacing: 0.12em;">JOMA</span>
          <span style="color: #888; font-size: 12px; margin-left: 12px; text-transform: uppercase; letter-spacing: 0.1em;">New Order</span>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 4px; font-size: 20px;">Order #${orderId}</h2>
          <p style="color: #888; font-size: 13px; margin: 0 0 24px;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>

          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #444; margin-bottom: 8px;">Customer</h3>
          <p style="margin: 0; font-size: 14px;">${customer.name || "—"}</p>
          <p style="margin: 2px 0; font-size: 14px; color: #555;">${customer.email || "—"}</p>
          <p style="margin: 2px 0 24px; font-size: 14px; color: #555;">${customer.phone || "—"}</p>

          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #444; margin-bottom: 8px;">Shipping Address</h3>
          <p style="margin: 0 0 24px; font-size: 14px; color: #555; line-height: 1.6;">
            ${[address.street, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
          </p>

          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #444; margin-bottom: 8px;">Order Items</h3>
          ${buildOrderItemsTable(items)}

          <div style="text-align: right; margin-top: 16px; padding-top: 16px; border-top: 2px solid #111;">
            <span style="font-size: 16px; font-weight: 700;">Total: ₹${order.totalAmount?.toLocaleString()}</span>
          </div>

          <div style="margin-top: 32px; text-align: center;">
            <a href="${dashboardUrl}" style="background: #111; color: #fff; padding: 12px 28px; text-decoration: none; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">View Order</a>
          </div>
        </div>
      </div>
    `,
  });
}

export async function sendCustomerOrderConfirmation(order: any): Promise<void> {
  const customer = order.customer || {};
  const customerEmail = customer.email;
  if (!customerEmail) return;

  const address = customer.address || {};
  const items = order.products?.length ? order.products : order.items || [];
  const orderId = order._id?.toString() || "N/A";
  const supportEmail = process.env.GMAIL_USER || "support@joma-studio.in";

  await transporter.sendMail({
    from: `"Joma" <${process.env.GMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmed — Joma #${orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: #111; padding: 32px; text-align: center;">
          <div style="color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 0.18em;">JOMA</div>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="margin: 0 0 8px; font-size: 22px;">Your order is confirmed.</h2>
          <p style="color: #666; font-size: 14px; margin: 0 0 32px; line-height: 1.6;">
            Thank you for shopping with Joma, ${customer.name?.split(" ")[0] || "there"}. We've received your order and it's being processed.
          </p>

          <div style="background: #f9f9f9; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Order number</p>
            <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600;">#${orderId}</p>
          </div>

          <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #444; margin-bottom: 8px;">Order Summary</h3>
          ${buildOrderItemsTable(items)}

          <div style="text-align: right; margin-top: 16px; padding-top: 16px; border-top: 2px solid #111;">
            <span style="font-size: 16px; font-weight: 700;">Total Paid: ₹${order.totalAmount?.toLocaleString()}</span>
          </div>

          <div style="margin-top: 32px;">
            <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #444; margin-bottom: 8px;">Shipping To</h3>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0;">
              ${customer.name}<br>
              ${[address.street, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
            </p>
          </div>

          <div style="margin-top: 32px; padding: 20px; background: #f9f9f9; border-left: 3px solid #111;">
            <p style="margin: 0; font-size: 14px; color: #444;">
              <strong>Estimated delivery:</strong> 5–7 business days
            </p>
          </div>

          <p style="margin-top: 32px; font-size: 13px; color: #888; line-height: 1.6;">
            Questions? Reply to this email or contact us at <a href="mailto:${supportEmail}" style="color: #111;">${supportEmail}</a>.
          </p>
        </div>
        <div style="background: #f4f4f4; padding: 20px 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #999; letter-spacing: 0.05em;">© ${new Date().getFullYear()} Joma. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}
