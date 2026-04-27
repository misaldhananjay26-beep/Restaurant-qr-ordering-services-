import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SiLmZCsjNCrFAG',
      key_secret: process.env.RAZORPAY_SECRET || 'l67VOSFg7FDD9DBYku57vmoW',
    });

    const order = await razorpay.orders.create({
      amount: 49900, // ₹499
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("Created Razorpay Order on Vercel:", order.id);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
}
