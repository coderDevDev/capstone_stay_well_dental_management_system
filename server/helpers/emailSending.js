import sgMail from '@sendgrid/mail';

import config from '../config.js';

export const sendEmail = async ({ data }) => {
  let link = data.link;

  sgMail.setApiKey(config.SENDGRID_API_KEY);
  let mailOptions = {
    from: 'admin@axztechItsolutions.com',
    to: 'dextermiranda441@gmail.com',
    subject: 'Bundle of Code(s) Approval',

    text: `
   New list of code(s) has been created by our system.
   This code is an integral part of our services as it will be use by our client.
   We would appreciate your review and approval.
    `,
    html: `
    <p>
      New list of code(s) has been created by our system.
      This code is an integral part of our services as it will be use by our client for their purchase.
      Please click this link to approve.
   </p>
    
   <p>Click on this <a href='${link}'>link</a> to confirm.</p>


    
    `
  };

  try {
    sgMail.send(mailOptions);

    console.log('email sent');
  } catch (error) {
    console.log('sendgrid');

    console.log(error);
  }
};
