import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const QuestionsAndAnswers = () => {
  return (
    <div>
        <Header />
    <div className="max-w-3xl mx-auto p-4"
    style={{
        paddingTop: '100px',
    }
    }
    >
      <h2 className="text-2xl font-bold mb-4">Questions and Answers</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">I'm new to VGC Hub, how can I get started?</h3>
        <p>
          To get started, you can sign up <a href="/signup" className="text-blue-500 underline">here</a>. Please note that you must have a valid email address to register, as email validation is required.
        </p>
        <p>
          Once registered and logged in, you can create your first post on the homepage! You can also search for specific users and follow them to add their posts and reposts to your timeline.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Why was VGC Hub created?</h3>
        <p>
          For more information, please visit the <a href="/about" className="text-blue-500 underline">About</a> page.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">I have an issue with a post/user, what can I do?</h3>
        <p>
          If you find an offensive post or user, you can report it using the "..." button, and the Admin team will handle the report.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">I want to delete all my data on VGC Hub, how can I do that?</h3>
        <p>
          To delete your account (including your avatar, posts, quotes, replies, likes, and reposts), you can click on your profile, then click the "..." button and go to Edit Profile. At the bottom of the page, you can click "Delete Account" to remove it permanently.
        </p>
        <p>
          If you want more information about your privacy, you can visit this <a href="/privacy" className="text-blue-500 underline">link</a>.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">I encountered a bug!</h3>
        <p>
          If you come across such an issue, you can contact <a href="https://twitter.com/electhor94" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">@electhor94</a> on Twitter.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">When will you add new features? (Notifications? Private Messages?)</h3>
        <p>
          Features like notifications and private messages are currently in development. We also plan to add post formatting for links, hashtags, and previews for certain links.
        </p>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default QuestionsAndAnswers;
