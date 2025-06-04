import PayOS from "@payos/node";
import crypto from "crypto";
import Rental from "../models/rental.model";
import Payment from "../models/payment.model";

export const createPayOSPayment = async (amount: number, orderCode: number) => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  const returnUrl = process.env.PAYOS_RETURN_URL;
  const cancelUrl = process.env.PAYOS_CANCEL_URL;
  const apiKey = process.env.PAYOS_API_KEY || "";

  console.log("clientId", clientId);
  console.log("checksumKey", checksumKey);
  console.log("returnUrl", returnUrl);
  console.log("cancelUrl", cancelUrl);
  console.log("apiKey", apiKey);
  console.log("orderCode", orderCode);

  if (!clientId || !checksumKey)
    throw new Error("Missing PAYOS_CLIENT_ID or PAYOS_CHECKSUM_KEY");
  if (!returnUrl || !cancelUrl) throw new Error("Missing RETURN or CANCEL URL");
  const returnUrlWithOrderCode = `${returnUrl}?orderCode=${orderCode}`;
  const cancelUrlWithOrderCode = `${cancelUrl}?orderCode=${orderCode}`;
  const payload = {
    orderCode,
    amount,
    description: "Đơn thuê thời trang",
    returnUrl: returnUrlWithOrderCode,
    cancelUrl: cancelUrlWithOrderCode,
  };

  const signature = crypto
    .createHmac("sha256", checksumKey)
    .update(JSON.stringify(payload))
    .digest("hex");

  const payos = new PayOS(clientId, apiKey, checksumKey);

  const paymentRequest = await payos.createPaymentLink(payload);
  return paymentRequest.checkoutUrl;
};
