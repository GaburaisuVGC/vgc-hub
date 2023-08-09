import React from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const PrivacyPage = () => {
  return (
    <div>
        <Header />
    <div className="max-w-3xl mx-auto p-4 flex flex-col min-h-screen"
        style={{paddingTop: "100px"}}
    >
      <h2 className="text-2xl font-bold mb-4">Privacy</h2>
      <p>
        At VGC Hub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
      </p>
      <h3 className="text-xl font-semibold my-4">Information We Collect</h3>
      <p>
        We collect information you provide directly to us when you register for an account, create or modify your profile, and post content. This information may include your username, email address, and profile picture.
      </p>
      <p>
        When you interact with others on our platform, we collect the content of your interactions, including posts, likes, reposts, and messages.
      </p>
      <h3 className="text-xl font-semibold my-4">How We Use Your Information</h3>
      <p>
        We use the information we collect to operate, maintain, and provide you with the features and functionality of our platform. Your profile information and public posts are visible to other users of VGC Hub.
      </p>
      <h3 className="text-xl font-semibold my-4">Data Security</h3>
      <p>
        We take measures to help protect your information from unauthorized access, alteration, disclosure, or destruction. However, no data transmission over the internet or electronic storage is fully secure, so we cannot guarantee the security of your information.
      </p>
      <h3 className="text-xl font-semibold my-4">Changes to this Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the updated policy on this page. Your continued use of VGC Hub after any changes indicates your agreement to the revised policy.
      </p>
      <p>
        If you have any questions or concerns about our Privacy Policy, you can contact us at vgchubdev@gmail.com.
      </p>
      <p className="mt-4 text-sm text-gray-500 italic">
        This Privacy Policy was last updated on August 8, 2023.
      </p>
    </div>
    <Footer />
    </div>
  );
};

export default PrivacyPage;
