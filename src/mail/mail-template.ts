export const emailTemplates = {
  en: {
    subject: 'Verify Your Email',
    content: (link: string) => `
      <div style="max-width: 600px; margin: auto; padding-top: 50px;">
        <table align="center" cellspacing="0" cellpadding="0" width="100%" style="border: 0px; border-bottom: 1px solid #D6D6D6; max-width: 600px;">
          <tbody>
            <tr>
              <td style="background-color: #FFF; color: #444; font-family: 'Amazon Ember','Helvetica Neue', Roboto, Arial, sans-serif; font-size: 14px; line-height: 140%; padding: 25px 35px;">
                <h1 style="font-size: 20px; font-weight: bold; line-height: 1.3; margin: 0 0 15px 0;">Welcome to Nexus Tag!</h1>
                <p style="margin: 0; padding: 0;">
                  Thank you for signing up. To complete your registration, please verify your email address.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #FFF; color: #444; font-family: 'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif; font-size: 14px; line-height: 140%; padding: 0px 35px 50px;">
                <a style="background-color: #3498db; color: white; padding-top: 5px; text-align: center; text-decoration: none; : 173px; : 32px;border-radius: 2px; font-family: 'amazon ember', 'helvetica neue', roboto, arial, sans-serif; font-size: 14px; display:table-row;" href="${link}" target="_blank" rel="noreferrer noopener">
                  <div style="display:table-cell;vertical-align:middle;align-text:center;padding: 10px 20px">
                    Verify Email
                  </div>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  },
  ko: {
    subject: '이메일 인증',
    content: (link: string) => `
      <div style="max-width: 600px; margin: auto; padding-top: 50px;">
        <table align="center" cellspacing="0" cellpadding="0" width="100%" style="border: 0px; border-bottom: 1px solid #D6D6D6; max-width: 600px;">
          <tbody>
            <tr>
              <td style="background-color: #FFF; color: #444; font-family: 'Amazon Ember','Helvetica Neue', Roboto, Arial, sans-serif; font-size: 14px; line-height: 140%; padding: 25px 35px;">
                <h1 style="font-size: 20px; font-weight: bold; line-height: 1.3; margin: 0 0 15px 0;">Nexus Tag에 오신 것을 환영합니다!</h1>
                <p style="margin: 0; padding: 0;">
                  가입해 주셔서 감사합니다. 등록을 완료하려면 이메일 주소를 인증해 주세요.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #FFF; color: #444; font-family: 'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif; font-size: 14px; line-height: 140%; padding: 0px 35px 50px;">
                <a style="background-color: #3498db; color: white; padding-top: 5px; text-align: center; text-decoration: none; : 173px; : 32px;border-radius: 2px; font-family: 'amazon ember', 'helvetica neue', roboto, arial, sans-serif; font-size: 14px; display:table-row;" href="${link}" target="_blank" rel="noreferrer noopener">
                  <div style="display:table-cell;vertical-align:middle;align-text:center;padding: 10px 20px">
                    이메일 인증하기
                  </div>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  },
};
