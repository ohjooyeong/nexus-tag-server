export const emailTemplates = {
  en: {
    subject: 'Verify Your Email',
    content: (link: string) =>
      `Click here to verify your email: <a href="${link}">Verify Email</a>`,
  },
  ko: {
    subject: '이메일 인증',
    content: (link: string) =>
      `이메일 인증을 위해 여기를 클릭하세요: <a href="${link}">이메일 인증</a>`,
  },

  sub: {
    content: (link: string) => ``,
  },
};
