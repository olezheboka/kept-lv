import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Mission Section */}
        <section className="glass-card rounded-2xl p-10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t("mission")}</h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            {t("missionText")}
          </p>
        </section>

        {/* How It Works Section */}
        <section className="glass-card rounded-2xl p-10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{t("howItWorks")}</h2>
          <p className="text-gray-300 leading-relaxed text-lg">
            {t("howItWorksText")}
          </p>
        </section>

        {/* Process Steps */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full
              bg-gradient-to-r from-blue-500 to-blue-600
              flex items-center justify-center">
              <span className="text-2xl font-black text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Collect</h3>
            <p className="text-gray-400">
              We gather promises from interviews, speeches, social media, and official documents.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full
              bg-gradient-to-r from-purple-500 to-purple-600
              flex items-center justify-center">
              <span className="text-2xl font-black text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Track</h3>
            <p className="text-gray-400">
              We monitor government actions, legislation, and news to track promise progress.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full
              bg-gradient-to-r from-emerald-500 to-emerald-600
              flex items-center justify-center">
              <span className="text-2xl font-black text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Report</h3>
            <p className="text-gray-400">
              We provide transparent, evidence-based assessments of each promise&apos;s status.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="glass-card rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-4">{t("contact")}</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Have information about a political promise? Want to contribute?
            Reach out to us.
          </p>
          <a
            href="mailto:info@kept.lv"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
              bg-gradient-to-r from-blue-500 to-blue-600
              text-white font-semibold hover:shadow-lg transition-all"
          >
            info@kept.lv
          </a>
        </section>
      </div>
    </div>
  );
}
