import assert from "node:assert/strict";
import { mapSiteSettingsData } from "../src/lib/site-settings";
import { zh } from "../src/locales/zh";
import { en } from "../src/locales/en";

function getDefaults(locale: "zh" | "en") {
  const t = locale === "zh" ? zh : en;
  return {
    hero: {
      heroImage: "",
      title: t.hero.title,
      tagline: t.hero.tagline,
      regionSub: t.hero.regionSub,
      subtitle: t.hero.subtitle,
      ctaRoutes: t.hero.ctaRoutes,
      ctaContact: t.hero.ctaContact,
      altImage: t.hero.altImage,
    },
    why: {
      sectionTitle: t.why.sectionTitle,
      sectionDesc: t.why.sectionDesc,
      items: t.why.items.map((item) => ({ title: item.title, desc: item.desc })),
      paymentTitle: t.why.payment.title,
      paymentDesc: t.why.payment.desc,
      translationTitle: t.why.translation.title,
      translationDesc: t.why.translation.desc,
    },
    journal: {
      sectionTitle: t.journal.sectionTitle,
      sectionDesc: t.journal.sectionDesc,
    },
    about: {
      title: t.about.title,
      body: t.about.body,
    },
    footer: {
      desc: t.footer.desc,
      copyright: t.footer.copyright,
      email: t.footer.email,
      instagram: t.footer.instagram,
      facebook: t.footer.facebook,
      whatsapp: t.footer.whatsapp,
      telegram: t.footer.telegram,
      wechat: t.footer.wechat,
      qrImage: "",
    },
  };
}

const savedShape = {
  hero: {
    titleZh: "中文主标题",
    titleEn: "English Hero",
    taglineZh: "中文标语",
    taglineEn: "English Tagline",
    regionSubZh: "中文副标题",
    regionSubEn: "English Region",
    subtitleZh: "中文描述",
    subtitleEn: "English Subtitle",
    ctaRoutesZh: "查看路线",
    ctaRoutesEn: "View Routes",
    ctaContactZh: "联系咨询",
    ctaContactEn: "Contact Us",
    altImageZh: "中文 Alt",
    altImageEn: "English Alt",
  },
  why: {
    sectionTitleZh: "中文 Why",
    sectionTitleEn: "English Why",
    sectionDescZh: "中文 Why 描述",
    sectionDescEn: "English Why Desc",
    items: [
      { titleZh: "中文1", titleEn: "English1", descZh: "描述1", descEn: "Desc1" },
      { titleZh: "中文2", titleEn: "English2", descZh: "描述2", descEn: "Desc2" },
      { titleZh: "中文3", titleEn: "English3", descZh: "描述3", descEn: "Desc3" },
      { titleZh: "中文4", titleEn: "English4", descZh: "描述4", descEn: "Desc4" },
    ],
    paymentTitleZh: "中文支付",
    paymentTitleEn: "English Payment",
    paymentDescZh: "中文支付描述",
    paymentDescEn: "English Payment Desc",
    translationTitleZh: "中文翻译",
    translationTitleEn: "English Translation",
    translationDescZh: "中文翻译描述",
    translationDescEn: "English Translation Desc",
  },
  journal: {
    sectionTitleZh: "中文手记",
    sectionTitleEn: "English Journal",
    sectionDescZh: "中文手记描述",
    sectionDescEn: "English Journal Desc",
  },
  about: {
    titleZh: "中文关于",
    titleEn: "English About",
    bodyZh: "中文正文",
    bodyEn: "English Body",
  },
  footer: {
    descZh: "中文页脚",
    descEn: "English Footer",
    copyrightZh: "中文版权",
    copyrightEn: "English Copyright",
    email: "hello@example.com",
    instagram: "@test",
    facebook: "test",
    whatsapp: "+8613800000000",
    telegram: "@test",
    wechat: "testwechat",
  },
};

const zhMapped = mapSiteSettingsData(savedShape, "zh", getDefaults("zh"));
const enMapped = mapSiteSettingsData(savedShape, "en", getDefaults("en"));

assert.equal(zhMapped.hero.title, "中文主标题");
assert.equal(enMapped.hero.title, "English Hero");
assert.equal(zhMapped.why.items[0]?.title, "中文1");
assert.equal(enMapped.why.items[0]?.title, "English1");
assert.equal(zhMapped.about.body, "中文正文");
assert.equal(enMapped.about.body, "English Body");
assert.equal(zhMapped.footer.email, "hello@example.com");
assert.equal(enMapped.footer.desc, "English Footer");

const legacyShape = {
  hero: {
    title: "旧标题",
    tagline: "旧标语",
  },
  why: {
    items: [{ title: "旧标题1", desc: "旧描述1" }],
  },
  journal: {},
  about: {},
  footer: {},
};

const legacyMapped = mapSiteSettingsData(legacyShape, "zh", getDefaults("zh"));
assert.equal(legacyMapped.hero.title, "旧标题");
assert.equal(legacyMapped.why.items[0]?.title, "旧标题1");

console.log("PASS: site-settings bilingual mapping works for new and legacy saved shapes");
