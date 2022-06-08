
const constants = {
    // Constant for JWT
    JWT_KEY: process.env.JWT_KEY || "CHANGEIT!!",

    // Constants for email.
    EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST || "mail.denovolab.com",
    EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT || 587,
    EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER || "noreply@denovolab.com",
    EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD || "LKDJFFH!!!hrm",

    OPENTACT_REST_API: process.env.OPENTACT_REST_API || "https://api.stage.opentact.org/rest",
	 OPENTACT_WSS: process.env.OPENTACT_WSS || "wss://api.opentact.org",
    OPENTACT_SIP_DOMAIN: process.env.OPENTACT_SIP_DOMAIN || "fonio.sip.stage.opentact.org",
    OPENTACT_SIP_APP_UUID: process.env.OPENTACT_SIP_APP_UUID || "08b731d5-ab4a-4e01-b4b1-d961df6984e0",
	 
    OPENTACT_USER: process.env.OPENTACT_USER || "leon229@yandex.ru",
    OPENTACT_PASSWORD: process.env.OPENTACT_PASSWORD || "123",

	 OPENTACT_ADMIN_EMAIL: process.env.OPENTACT_ADMIN_EMAIL,
    OPENTACT_ADMIN_PASSWORD: process.env.OPENTACT_ADMIN_PASSWORD,


    FONIO_URL: process.env.FONIO_URL || "http://148.251.91.143:8083",
    FONIO_DOMAIN: process.env.FONIO_DOMAIN || "https://fonio.app/",

    //PAYMENTS
    PAYMENT_SUCCESS_URL: process.env.PAYMENT_SUCCESS_URL || 'http://148.251.91.143:8083/u/b/numbers/create/finish',
    PAYMENT_CANCEL_URL: process.env.PAYMENT_CANCEL_URL || 'http://148.251.91.143:8083/u/b/numbers/create/finish',
    //STRIPE
    STRIPE_SANDBOX: process.env.STRIPE_SANDBOX || false,
    STRIPE_SECRET:
        process.env.STRIPE_SECRET || "sk_test_51HsOzPB7TfyNN01C5U28mPM2LH81f2sLqXHqYaQEPAS0znwpRmpLnadGfTL67qSA0QjtoeMY9djNRDUDRz815HjF00qXb9Oeme",
    STRIPE_WEBHOOK_SECRET:
        process.env.STRIPE_WEBHOOK_SECRET ||
        "whsec_u7fSz7LSYFYtckjRrGAIerPsPEI1zKBv",
    //PAYPAL
    PAYPAL_SANDBOX: process.env.PAYPAL_SANDBOX || false,
    PAYPAL_API: process.env.PAYPAL_SANDBOX
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com",
    PAYPAL_CLIENT:
        process.env.PAYPAL_CLIENT ||
        "AUJoKVGO3q1WA1tGgAKRdY6qx0qQNIQ6vl6D3k7y64T4qh5WozIQ7V3dl3iusw5BwXYg_T5FzLCRguP8",
    PAYPAL_SECRET:
        process.env.PAYPAL_SECRET ||
        "EOw8LNwDhM7esrQ3nHfzKc7xiWnJc83Eawln4YLfUgivfx1LGzu9Mj0F5wlarilXDqdK9Q5aHVo-VGjJ",

    //FILES
    PATH_TO_IMAGE_FOLDER: process.env.NODE_ENV === "development" ? 
        process.env.DEV_PATH_TO_IMAGE_FOLDER || "assets/dev/profile" :
        process.env.PROD_PATH_TO_IMAGE_FOLDER || "assets/prod/profile",

    PATH_TO_AUDIO_FOLDER: process.env.NODE_ENV === "development" ? 
        process.env.DEV_PATH_TO_AUDIO_FOLDER || "assets/dev/recordings" :
        process.env.PROD_PATH_TO_AUDIO_FOLDER || "assets/prod/recordings",

    PATH_TO_VOICEMAIL_FOLDER: process.env.NODE_ENV === "development" ? 
        process.env.DEV_PATH_TO_VOICEMAIL_FOLDER || "assets/dev/voicemail" :
        process.env.PROD_PATH_TO_VOICEMAIL_FOLDER || "assets/prod/voicemail",

    PATH_TO_TEMP_XML: process.env.PATH_TO_TEMP_XML || "assets/temp_xml",
};

export default constants