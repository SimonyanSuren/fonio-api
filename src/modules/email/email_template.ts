'use strict';

import {EmailOptions} from './email_options';

export const EmailTemplate: { [messageCode: string]: EmailOptions } = {
    'auth:success': {
        subject: "HI {FIRST_NAME} {LAST_NAME}",
        template: `<html>
            <head></head>
            <body>
            <style>
                /*  "CORE" STYLES */
                :root {
                    --vb-color-primary: #4b7cf3;
                    --vb-font-family: 'Mukta', sans-serif;
                }
        
                html {
                    font-size: 15px;
                }
        
                @media (max-width: 575px) {
                    html {
                        font-size: 14px;
                    }
                }
        
                body {
                    font-size: 1rem;
                    line-height: 1.5;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                    overflow-x: hidden;
                    position: relative;
                    font-variant: normal;
                    font-feature-settings: normal;
                }
        
                a {
                    text-decoration: none;
                    color: #595c97;
                    transition: color 0.2s ease-in-out;
                }
        
                a:hover, a:active, a:focus {
                    color: var(--vb-color-primary);
                    text-decoration: none;
                }
        
                input {
                    outline: none !important;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                }
        
                button,
                input {
                    box-shadow: none !important;
                    outline: none !important;
                }
        
                input[type='text'],
                input[type='password'],
                input[type='email'],
                textarea {
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
        
                h1,
                h2,
                h3,
                h4,
                h5,
                h6 {
                    color: #141322;
                }
        
                svg {
                    vertical-align: initial;
                    overflow: auto;
                }
        
                .badge-example {
                    font-size: 0.93rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    background: #e4e9f0;
                    color: #141322;
                    display: inline-block;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                }
        
                [data-vb-theme='dark'] body {
                    background: #141322;
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] .badge-example {
                    background: #232135;
                }
        
                [data-vb-theme='dark'] h1,
                [data-vb-theme='dark'] h2,
                [data-vb-theme='dark'] h3,
                [data-vb-theme='dark'] h4,
                [data-vb-theme='dark'] h5,
                [data-vb-theme='dark'] h6 {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a:hover, [data-vb-theme='dark'] a:active, [data-vb-theme='dark'] a:focus {
                    text-decoration: none;
                }
            </style>
        
        
            <div style="width: 100%; background: #f2f4f8; padding: 50px 20px; color: #514d6a;">
        
                <div style="max-width: 700px; margin: 0px auto; font-size: 14px">
                    <div style="padding: 20px 0 1px 23px;background-color: #e1e8f3">
                        <table style="border-collapse: collapse; border: 0; width: 100%; margin-bottom: 20px">
                            <tbody><tr>
                                <td style="vertical-align: top;">
                                    <img style="width: 138px;height: 40px" src="{LOGO}" alt="">
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                        <span style="color: #a09bb9;">
        
                        </span>
                                </td>
                            </tr>
                            </tbody></table>
                    </div>
        
                    <div style="padding: 40px 40px 20px 40px; background: #fff;">
                        <table style="border-collapse: collapse; border: 0; width: 100%;">
                            <tbody>
                            <tr>
                                <td> <h1 style="color: #23c0ff">Confirm Your Email Address</h1></td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Hi <b>{FIRST_NAME} {LAST_NAME}</b>, Welcome</p>
                                    <p>
                                    You are receiving this email because you have registered on our site.
                                    </p>
                                    <p>
                                        Registration was successful. Thank you for joining Fonio.
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #a09bb9; margin-top: 20px">
                        <p>
                        <!-- copyrigth part-->
                        </p>
                    </div>
                </div>
            </div>
            </body>
        </html>`
    },
    'auth:signup': {
        subject: "HI {FIRST_NAME} {LAST_NAME}",
        template: `<hrml>
            <head></head>
            <body>
            <style>
                /*  "CORE" STYLES */
                :root {
                    --vb-color-primary: #4b7cf3;
                    --vb-font-family: 'Mukta', sans-serif;
                }
        
                html {
                    font-size: 15px;
                }
        
                @media (max-width: 575px) {
                    html {
                        font-size: 14px;
                    }
                }
        
                body {
                    font-size: 1rem;
                    line-height: 1.5;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                    overflow-x: hidden;
                    position: relative;
                    font-variant: normal;
                    font-feature-settings: normal;
                }
        
                a {
                    text-decoration: none;
                    color: #595c97;
                    transition: color 0.2s ease-in-out;
                }
        
                a:hover, a:active, a:focus {
                    color: var(--vb-color-primary);
                    text-decoration: none;
                }
        
                input {
                    outline: none !important;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                }
        
                button,
                input {
                    box-shadow: none !important;
                    outline: none !important;
                }
        
                input[type='text'],
                input[type='password'],
                input[type='email'],
                textarea {
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
        
                h1,
                h2,
                h3,
                h4,
                h5,
                h6 {
                    color: #141322;
                }
        
                svg {
                    vertical-align: initial;
                    overflow: auto;
                }
        
                .badge-example {
                    font-size: 0.93rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    background: #e4e9f0;
                    color: #141322;
                    display: inline-block;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                }
        
                [data-vb-theme='dark'] body {
                    background: #141322;
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] .badge-example {
                    background: #232135;
                }
        
                [data-vb-theme='dark'] h1,
                [data-vb-theme='dark'] h2,
                [data-vb-theme='dark'] h3,
                [data-vb-theme='dark'] h4,
                [data-vb-theme='dark'] h5,
                [data-vb-theme='dark'] h6 {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a:hover, [data-vb-theme='dark'] a:active, [data-vb-theme='dark'] a:focus {
                    text-decoration: none;
                }
            </style>
        
        
            <div style="width: 100%; background: #f2f4f8; padding: 50px 20px; color: #514d6a;">
        
                <div style="max-width: 700px; margin: 0px auto; font-size: 14px">
                    <div style="padding: 20px 0 1px 23px;background-color: #e1e8f3">
                        <table style="border-collapse: collapse; border: 0; width: 100%; margin-bottom: 20px">
                            <tbody><tr>
                                <td style="vertical-align: top;">
                                    <img style="width: 138px;height: 40px" src="{LOGO}" alt="">
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                        <span style="color: #a09bb9;">
        
                        </span>
                                </td>
                            </tr>
                            </tbody></table>
                    </div>
        
                    <div style="padding: 40px 40px 20px 40px; background: #fff;">
                        <table style="border-collapse: collapse; border: 0; width: 100%;">
                            <tbody>
                            <tr>
                                <td> <h1 style="color: #23c0ff">Confirm Your Email Address</h1></td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Hi <b>{FIRST_NAME} {LAST_NAME}</b>, Welcome</p>
                                    <p>
                                    You are receiving this email because you have registered on our site.
                                    </p>
                                    <p>
                                        Click the link below to confirm your registration request.
                                    </p>
                                    <p>
                                        This link will expire in 15 minutes and can only used once
                                    </p>
                                    <a href="{BUTTON}" onClick="fonioVerify()" style="display: inline-block; padding: 11px 30px 6px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #01a8fe; border-radius: 5px">
                                        Verify Email
                                    </a>
                                    <p>
                                        <b>OR</b>
                                    </p>
                                    <p>If the button above does not work, paste this link into your web browser:</p>
                                    <p>
                                        {LINK}
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #a09bb9; margin-top: 20px">
                        <p>
                        <!-- copyrigth part-->
                        </p>
                    </div>
                </div>
            </div>
            </body>
        </hrml>`
    },
    'user:invite': {
        subject: "HI {FIRST_NAME} {LAST_NAME}, you have received an invitation",
        template: ` <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <style>
                /* -------------------------------------
                    GLOBAL RESETS
                ------------------------------------- */
                
                /*All the styling goes here*/
                
                img {
                    border: none;
                    -ms-interpolation-mode: bicubic;
                    max-width: 100%; 
                }

                body {
                    background-color: #f6f6f6;
                    font-family: sans-serif;
                    -webkit-font-smoothing: antialiased;
                    font-size: 14px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 0;
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%; 
                }

                table {
                    border-collapse: separate;
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                    width: 100%; }
                    table td {
                    font-family: sans-serif;
                    font-size: 14px;
                    vertical-align: top; 
                }

                /* -------------------------------------
                    BODY & CONTAINER
                ------------------------------------- */

                .body {
                    background-color: #f6f6f6;
                    width: 100%; 
                }

                /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                .container {
                    display: block;
                    margin: 0 auto !important;
                    /* makes it centered */
                    max-width: 580px;
                    padding: 10px;
                    width: 580px; 
                }

                /* This should also be a block element, so that it will fill 100% of the .container */
                .content {
                    box-sizing: border-box;
                    display: block;
                    margin: 0 auto;
                    max-width: 580px;
                    padding: 10px; 
                }

                /* -------------------------------------
                    HEADER, FOOTER, MAIN
                ------------------------------------- */
                .main {
                    background: #ffffff;
                    border-radius: 3px;
                    width: 100%; 
                }

                .wrapper {
                    box-sizing: border-box;
                    padding: 20px; 
                }

                .content-block {
                    padding-bottom: 10px;
                    padding-top: 10px;
                }

                .footer {
                    clear: both;
                    margin-top: 10px;
                    text-align: center;
                    width: 100%; 
                }
                    .footer td,
                    .footer p,
                    .footer span,
                    .footer a {
                    color: #999999;
                    font-size: 12px;
                    text-align: center; 
                }

                /* -------------------------------------
                    TYPOGRAPHY
                ------------------------------------- */
                h1,
                h2,
                h3,
                h4 {
                    color: #000000;
                    font-family: sans-serif;
                    font-weight: 400;
                    line-height: 1.4;
                    margin: 0;
                    margin-bottom: 30px; 
                }

                h1 {
                    font-size: 35px;
                    font-weight: 300;
                    text-align: center;
                    text-transform: capitalize; 
                }

                p,
                ul,
                ol {
                    font-family: sans-serif;
                    font-size: 14px;
                    font-weight: normal;
                    margin: 0;
                    margin-bottom: 15px; 
                }
                    p li,
                    ul li,
                    ol li {
                    list-style-position: inside;
                    margin-left: 5px; 
                }

                a {
                    color: #3498db;
                    text-decoration: underline; 
                }

                /* -------------------------------------
                    BUTTONS
                ------------------------------------- */
                .btn {
                    box-sizing: border-box;
                    width: 100%; }
                    .btn > tbody > tr > td {
                    padding-bottom: 15px; }
                    .btn table {
                    width: auto; 
                }
                    .btn table td {
                    background-color: #ffffff;
                    border-radius: 5px;
                    text-align: center; 
                }
                    .btn a {
                    background-color: #ffffff;
                    border: solid 1px #3498db;
                    border-radius: 5px;
                    box-sizing: border-box;
                    color: #3498db;
                    cursor: pointer;
                    display: inline-block;
                    font-size: 14px;
                    font-weight: bold;
                    margin: 0;
                    padding: 12px 25px;
                    text-decoration: none;
                    text-transform: capitalize; 
                }

                .btn-primary table td {
                    background-color: #3498db; 
                }

                .btn-primary a {
                    background-color: #3498db;
                    border-color: #3498db;
                    color: #ffffff; 
                }

                /* -------------------------------------
                    OTHER STYLES THAT MIGHT BE USEFUL
                ------------------------------------- */
                .last {
                    margin-bottom: 0; 
                }

                .first {
                    margin-top: 0; 
                }

                .align-center {
                    text-align: center; 
                }

                .align-right {
                    text-align: right; 
                }

                .align-left {
                    text-align: left; 
                }

                .clear {
                    clear: both; 
                }

                .mt0 {
                    margin-top: 0; 
                }

                .mb0 {
                    margin-bottom: 0; 
                }

                .preheader {
                    color: transparent;
                    display: none;
                    height: 0;
                    max-height: 0;
                    max-width: 0;
                    opacity: 0;
                    overflow: hidden;
                    mso-hide: all;
                    visibility: hidden;
                    width: 0; 
                }

                .powered-by a {
                    text-decoration: none; 
                }

                hr {
                    border: 0;
                    border-bottom: 1px solid #f6f6f6;
                    margin: 20px 0; 
                }

                .font-weight-bold {
                    font-weight: bold;
                }

                /* -------------------------------------
                    RESPONSIVE AND MOBILE FRIENDLY STYLES
                ------------------------------------- */
                @media only screen and (max-width: 620px) {
                    table.body h1 {
                    font-size: 28px !important;
                    margin-bottom: 10px !important; 
                    }
                    table.body p,
                    table.body ul,
                    table.body ol,
                    table.body td,
                    table.body span,
                    table.body a {
                    font-size: 16px !important; 
                    }
                    table.body .wrapper,
                    table.body .article {
                    padding: 10px !important; 
                    }
                    table.body .content {
                    padding: 0 !important; 
                    }
                    table.body .container {
                    padding: 0 !important;
                    width: 100% !important; 
                    }
                    table.body .main {
                    border-left-width: 0 !important;
                    border-radius: 0 !important;
                    border-right-width: 0 !important; 
                    }
                    table.body .btn table {
                    width: 100% !important; 
                    }
                    table.body .btn a {
                    width: 100% !important; 
                    }
                    table.body .img-responsive {
                    height: auto !important;
                    max-width: 100% !important;
                    width: auto !important; 
                    }
                }

                /* -------------------------------------
                    PRESERVE THESE STYLES IN THE HEAD
                ------------------------------------- */
                @media all {
                    .ExternalClass {
                    width: 100%; 
                    }
                    .ExternalClass,
                    .ExternalClass p,
                    .ExternalClass span,
                    .ExternalClass font,
                    .ExternalClass td,
                    .ExternalClass div {
                    line-height: 100%; 
                    }
                    .apple-link a {
                    color: inherit !important;
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    text-decoration: none !important; 
                    }
                    #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                    font-size: inherit;
                    font-family: inherit;
                    font-weight: inherit;
                    line-height: inherit;
                    }
                    .btn-primary table td:hover {
                    background-color: #34495e !important; 
                    }
                    .btn-primary a:hover {
                    background-color: #34495e !important;
                    border-color: #34495e !important; 
                    } 
                }

                </style>
            </head>
            <body>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                <tr>
                    <td>&nbsp;</td>
                    <td class="container">
                    <div class="content">

                        <!-- START CENTERED WHITE CONTAINER -->
                        <table role="presentation" class="main">
								<td style="vertical-align: top;">
								<img style="display:block;padding: 20px" width="125px" height="35px"  src="{LOGO}" alt="Logo" title="Logo" >
								</td>

                        <!-- START MAIN CONTENT AREA -->
                        <tr>
                            <td class="wrapper">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                <td>
                                    <p class="font-weight-bold">Dear {FIRST_NAME} {LAST_NAME},</p>
                                    <p>A request to invite you to join the fonio of <span class="font-weight-bold">{COMPANY_NAME}</span> has been made. If you did not make the request, simply ignore this email. If you are aware of this request, please click on Confirm button.</p>
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                                    <tbody>
                                        <tr>
                                        <td align="left">
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                            <tbody>
                                                <tr>
                                                <td> <a href="{LINK}" target="_blank">Confirm</a> </td>
                                                </tr>
                                            </tbody>
                                            </table>
                                        </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                    <p class="font-weight-bold">Thanks(Fonio team)</p>
                                </td>
                                </tr>
                            </table>
                            </td>
                        </tr>

                        <!-- END MAIN CONTENT AREA -->
                        </table>
                        <!-- END CENTERED WHITE CONTAINER -->

                        <!-- START FOOTER -->
                        <div class="footer">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                            <td class="content-block">
                                If the button above does not work, try copying and pasting the URL into your browser. If you continue to have probelms, please feel free to contact us at info@fonio.com
                            </td>
                            </tr>
                            <tr>
                            <td class="content-block powered-by">
                                Powered by <a href="https://fonio.app">fonio</a>.
                            </td>
                            </tr>
                        </table>
                        </div>
                        <!-- END FOOTER -->

                    </div>
                    </td>
                    <td>&nbsp;</td>
                </tr>
                </table>
            </body>
            </html>
        `,
    },
    'auth:resetPassword': {
        subject: "HI {FIRST_NAME} {LAST_NAME}, reset your password ",
        template: ` <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <style type="text/css">
            /* CLIENT-SPECIFIC STYLES */
            body, table, td, a{-webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;} /* Prevent WebKit and Windows mobile changing default text sizes */
            table, td{mso-table-lspace: 0pt; mso-table-rspace: 0pt;} /* Remove spacing between tables in Outlook 2007 and up */
            img{-ms-interpolation-mode: bicubic;} /* Allow smoother rendering of resized image in Internet Explorer */
        
            /* RESET STYLES */
            img{border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;}
            table{border-collapse: collapse !important;}
            body{height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important;}
        
            /* iOS BLUE LINKS */
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
        
            /* MOBILE STYLES */
            @media screen and (max-width: 525px) {
        
                /* ALLOWS FOR FLUID TABLES */
                .wrapper {
                  width: 100% !important;
                    max-width: 100% !important;
                }
        
                /* ADJUSTS LAYOUT OF LOGO IMAGE */
                .logo img {
                  margin: 0 auto !important;
                }
        
                /* USE THESE CLASSES TO HIDE CONTENT ON MOBILE */
                .mobile-hide {
                  display: none !important;
                }
        
                .img-max {
                  max-width: 100% !important;
                  width: 100% !important;
                  height: auto !important;
                }
        
                /* FULL-WIDTH TABLES */
                .responsive-table {
                  width: 100% !important;
                }
        
                /* UTILITY CLASSES FOR ADJUSTING PADDING ON MOBILE */
                .padding {
                  padding: 10px 5% 15px 5% !important;
                }
        
                .padding-meta {
                  padding: 30px 5% 0px 5% !important;
                  text-align: center;
                }
        
                .padding-copy {
                     padding: 10px 5% 10px 5% !important;
                  text-align: center;
                }
        
                .no-padding {
                  padding: 0 !important;
                }
        
                .section-padding {
                  padding: 50px 15px 50px 15px !important;
                }
        
                /* ADJUST BUTTONS ON MOBILE */
                .mobile-button-container {
                    margin: 0 auto;
                    width: 100% !important;
                }
        
                .mobile-button {
                    padding: 15px !important;
                    border: 0 !important;
                    font-size: 16px !important;
                    display: block !important;
                }
        
            }
        
            /* ANDROID CENTER FIX */
            div[style*="margin: 16px 0;"] { margin: 0 !important; }
        </style>
        </head>
        <body style="margin: 0 !important; padding: 0 !important;">
        
        <!-- ONE COLUMN SECTION -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 15px;" class="section-padding">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="500">
                    <tr>
                    <td align="center" valign="top" width="500">
                    <![endif]-->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="responsive-table">
                        <tr>
                            <td>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <!-- COPY -->
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td align="left" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">Hey {FIRST_NAME} {LAST_NAME},</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">To reset your password, please use this Key</td>
                                                </tr>
                                                <!-- <tr>
                                                    <td align="left" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">To reset your password, please click {LINK}<a href="{LINK}"></a></td>
                                                </tr> -->
                                                <tr>
                                                   <td align="left" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">{HASH}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
            <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 20px 0px;">
                    <!--[if (gte mso 9)|(IE)]>
                    <table align="center" border="0" cellspacing="0" cellpadding="0" width="500">
                    <tr>
                    <td align="center" valign="top" width="500">
                    <![endif]-->
                    <!-- UNSUBSCRIBE COPY -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 500px;" class="responsive-table">
                        <tr>
                            <td align="left" style="font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;">
                                1234 Main Street, Anywhere, MA 01234, USA
                                </td>
                        </tr>
                    </table>
                    <!--[if (gte mso 9)|(IE)]>
                    </td>
                    </tr>
                    </table>
                    <![endif]-->
                </td>
            </tr>
        </table>
        
        </body>
        </html>
        `,
    },
    'auth:notification': {
        subject: "HI {FIRST_NAME} {LAST_NAME}",
        template: `<hrml>
            <head></head>
            <body>
            <style>
                /*  "CORE" STYLES */
                :root {
                    --vb-color-primary: #4b7cf3;
                    --vb-font-family: 'Mukta', sans-serif;
                }
        
                html {
                    font-size: 15px;
                }
        
                @media (max-width: 575px) {
                    html {
                        font-size: 14px;
                    }
                }
        
                body {
                    font-size: 1rem;
                    line-height: 1.5;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                    overflow-x: hidden;
                    position: relative;
                    font-variant: normal;
                    font-feature-settings: normal;
                }
        
                a {
                    text-decoration: none;
                    color: #595c97;
                    transition: color 0.2s ease-in-out;
                }
        
                a:hover, a:active, a:focus {
                    color: var(--vb-color-primary);
                    text-decoration: none;
                }
        
                input {
                    outline: none !important;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                }
        
                button,
                input {
                    box-shadow: none !important;
                    outline: none !important;
                }
        
                input[type='text'],
                input[type='password'],
                input[type='email'],
                textarea {
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
        
                h1,
                h2,
                h3,
                h4,
                h5,
                h6 {
                    color: #141322;
                }
        
                svg {
                    vertical-align: initial;
                    overflow: auto;
                }
        
                .badge-example {
                    font-size: 0.93rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    background: #e4e9f0;
                    color: #141322;
                    display: inline-block;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                }
        
                [data-vb-theme='dark'] body {
                    background: #141322;
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] .badge-example {
                    background: #232135;
                }
        
                [data-vb-theme='dark'] h1,
                [data-vb-theme='dark'] h2,
                [data-vb-theme='dark'] h3,
                [data-vb-theme='dark'] h4,
                [data-vb-theme='dark'] h5,
                [data-vb-theme='dark'] h6 {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a:hover, [data-vb-theme='dark'] a:active, [data-vb-theme='dark'] a:focus {
                    text-decoration: none;
                }
            </style>
        
        
            <div style="width: 100%; background: #f2f4f8; padding: 50px 20px; color: #514d6a;">
        
                <div style="max-width: 700px; margin: 0px auto; font-size: 14px">
                    <div style="padding: 20px 0 1px 23px;background-color: #e1e8f3">
                        <table style="border-collapse: collapse; border: 0; width: 100%; margin-bottom: 20px">
                            <tbody><tr>
                                <td style="vertical-align: top;">
                                    <img style="width: 138px;height: 40px" src="{LOGO}" alt="">
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                        <span style="color: #a09bb9;">
        
                        </span>
                                </td>
                            </tr>
                            </tbody></table>
                    </div>
        
                    <div style="padding: 40px 40px 20px 40px; background: #fff;">
                        <table style="border-collapse: collapse; border: 0; width: 100%;">
                            <tbody>
                            <tr>
                                <td> <h1 style="color: #23c0ff">Notification</h1></td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Hi <b>{FIRST_NAME} {LAST_NAME}</p>
                                    <p>{MESSAGE}</p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #a09bb9; margin-top: 20px">
                        <p>
                        <!-- copyrigth part-->
                        </p>
                    </div>
                </div>
            </div>
            </body>
        </hrml>`
    },
    'mail:voicemail': {
        subject: "Voicemail from {FIRST_NAME} {LAST_NAME}",
        template: `<hrml>
            <head></head>
            <body>
            <style>
                /*  "CORE" STYLES */
                :root {
                    --vb-color-primary: #4b7cf3;
                    --vb-font-family: 'Mukta', sans-serif;
                }
        
                html {
                    font-size: 15px;
                }
        
                @media (max-width: 575px) {
                    html {
                        font-size: 14px;
                    }
                }
        
                body {
                    font-size: 1rem;
                    line-height: 1.5;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                    overflow-x: hidden;
                    position: relative;
                    font-variant: normal;
                    font-feature-settings: normal;
                }
        
                a {
                    text-decoration: none;
                    color: #595c97;
                    transition: color 0.2s ease-in-out;
                }
        
                a:hover, a:active, a:focus {
                    color: var(--vb-color-primary);
                    text-decoration: none;
                }
        
                input {
                    outline: none !important;
                    font-family: var(--vb-font-family);
                    color: #595c97;
                }
        
                button,
                input {
                    box-shadow: none !important;
                    outline: none !important;
                }
        
                input[type='text'],
                input[type='password'],
                input[type='email'],
                textarea {
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                }
        
                h1,
                h2,
                h3,
                h4,
                h5,
                h6 {
                    color: #141322;
                }
        
                svg {
                    vertical-align: initial;
                    overflow: auto;
                }
        
                .badge-example {
                    font-size: 0.93rem;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    background: #e4e9f0;
                    color: #141322;
                    display: inline-block;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                }
        
                [data-vb-theme='dark'] body {
                    background: #141322;
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] .badge-example {
                    background: #232135;
                }
        
                [data-vb-theme='dark'] h1,
                [data-vb-theme='dark'] h2,
                [data-vb-theme='dark'] h3,
                [data-vb-theme='dark'] h4,
                [data-vb-theme='dark'] h5,
                [data-vb-theme='dark'] h6 {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a {
                    color: #aeaee0;
                }
        
                [data-vb-theme='dark'] a:hover, [data-vb-theme='dark'] a:active, [data-vb-theme='dark'] a:focus {
                    text-decoration: none;
                }
            </style>
        
        
            <div style="width: 100%; background: #f2f4f8; padding: 50px 20px; color: #514d6a;">
        
                <div style="max-width: 700px; margin: 0px auto; font-size: 14px">
                    <div style="padding: 20px 0 1px 23px;background-color: #e1e8f3">
                        <table style="border-collapse: collapse; border: 0; width: 100%; margin-bottom: 20px">
                            <tbody><tr>
                                <td style="vertical-align: top;">
                                    <img style="width: 138px;height: 40px" src="{LOGO}" alt="">
                                </td>
                                <td style="text-align: right; vertical-align: middle;">
                        <span style="color: #a09bb9;">
        
                        </span>
                                </td>
                            </tr>
                            </tbody></table>
                    </div>
        
                    <div style="padding: 40px 40px 20px 40px; background: #fff;">
                        <table style="border-collapse: collapse; border: 0; width: 100%;">
                            <tbody>
                            <tr>
                                <td> <h1 style="color: #23c0ff">Voicemail</h1></td>
                            </tr>
                            <tr>
                                <td>
                                    <p>From <b>{FIRST_NAME} {LAST_NAME}</p>
                                    <p>Download here</p>
                                    <p> 
                                        {AUDIO_LINK}<a href="{AUDIO_LINK}"></a>
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align: center; font-size: 12px; color: #a09bb9; margin-top: 20px">
                        <p>
                        <!-- copyrigth part-->
                        </p>
                    </div>
                </div>
            </div>
            </body>
        </hrml>`
    },
};
