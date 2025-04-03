const TelegramBot = require("node-telegram-bot-api");
const Order = require("../models/order");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
const bot = new TelegramBot(token, { polling: true });
const frontEndUrl = "https://narciskh-6d922.web.app/Admin/Manage-Order/";
async function sendNewOrderNotification(orderId) {
  try {
    const order = await Order.findById(orderId)
      .populate("cityProvince")
      .populate("employee")
      .populate("clothAndQuantities.cloth")
      .populate("clothAndQuantities.cloth.category");

    const formattedPhoneNumber =
      order.phone[0] === "0" ? `+855${order.phone.slice(1)}` : order.phone;

    // Construct the message with HTML formatting
    const message =
      `New order received!\n\n` +
      `<b>Order ID:</b> ${order.id}\n` +
      `<b>Customer:</b> ${order.fullName}\n` +
      `<b>Phone:</b> ${formattedPhoneNumber}\n` +
      `<b>Address:</b> ${order.address}\n` +
      `<b>City/Province:</b> ${order.cityProvince.name_en}\n` +
      `<b>Note:</b> ${order.note || "N/A"}\n` +
      `<b>Total Price:</b> ${order.totalPrice.toFixed(2)}\n\n` +
      `<b><a href='https://t.me/${formattedPhoneNumber}'>Contact Customer on Telegram</a></b>\n` +
      `<b><a href='${frontEndUrl}${order._id}'>Check Order Link</a></b>\n` +
      `<b>Clothes:</b>\n` +
      `${order.clothAndQuantities
        .map(
          (cloth) =>
            `- ${cloth.quantity} x ${cloth.cloth.name} (${cloth.sizes})`
        )
        .join("\n")}`;

    // Make sure to use the correct chat ID and parse mode
    return bot
      .sendMessage(chatId, message, { parse_mode: "HTML" })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
  } catch (error) {
    console.error("Error retrieving order or sending message:", error);
  }
}

module.exports = { sendNewOrderNotification };
