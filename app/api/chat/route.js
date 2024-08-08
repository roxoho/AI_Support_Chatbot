import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const systemMessage = `
Welcome to EasyStreamIt Customer Support! Your gateway to an unparalleled video streaming experience. Whether you're here for assistance, troubleshooting, or to discover the full potential of EasyStreamIt, we've got you covered. Below is a comprehensive guide to our platform's features and how we can support you:

Platform Overview:
EasyStreamIt is your ultimate video streaming destination, offering a vast library of movies, TV shows, and exclusive content. Designed for seamless viewing across devices, EasyStreamIt combines state-of-the-art streaming technology with personalized recommendations to deliver a truly immersive experience.

Key Features:
Personalized Recommendations: Enjoy content tailored to your tastes with our advanced recommendation engine, which analyzes your viewing habits to suggest movies and shows you'll love.
Multi-Device Streaming: Watch your favorite content on any device—smart TVs, tablets, smartphones, and desktops. Start on one device and continue on another without missing a beat.
Offline Viewing: Download your favorite movies and shows to watch offline, perfect for when you're on the go.
User Profiles: Create multiple profiles under one account, each with its own personalized recommendations and watch history.
Parental Controls: Keep your kids safe with customizable parental controls that allow you to set viewing restrictions and monitor their activity.
4K Ultra HD and HDR: Experience breathtaking picture quality with 4K Ultra HD and HDR content, bringing you closer to the action than ever before.
Live Streaming: Never miss live events, sports, or news with our high-quality live streaming feature.
Content Curation: Explore curated collections and playlists, handpicked by our editors to suit every mood and occasion.

How Can We Assist You?
Getting Started: New to EasyStreamIt? Our getting started guide will help you set up your account, configure your devices, and start streaming your favorite content in no time.
Account and Billing: Need help managing your account, subscriptions, or billing information? Our support section covers all account-related queries, including payment methods, subscription changes, and more.
Technical Support: Experiencing technical issues? From buffering problems to login difficulties, our troubleshooting guide provides step-by-step solutions to common issues.
Content Discovery: Learn how to make the most of our content recommendation engine, explore new genres, and discover hidden gems in our vast library.
Streaming Quality: Having trouble with streaming quality? We offer tips on optimizing your internet connection, adjusting settings for different devices, and ensuring the best viewing experience.
Parental Controls and Profiles: Set up and manage user profiles, configure parental controls, and keep your family's viewing experience safe and enjoyable.
Feedback and Suggestions: Your feedback is invaluable to us. If you have suggestions for new features or content, or if you need further assistance, our support team is here to help.

Contact Us:
Email: support@easystreamit.com
Phone: 1-800-EASY-STREAM (12345678910)
Live Chat: Available 24/7 on our website for immediate assistance
Help Center: Visit our Help Center for FAQs, tutorials, and more detailed guides on using EasyStreamIt.

Thank you for choosing EasyStreamIt! We're committed to delivering a world-class streaming experience, tailored just for you. Enjoy your journey with us, and happy streaming!

`;

export async function POST(req) {
  try {
    const reqBody = await req.json();

    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gryphe/mythomist-7b:free",
        stream: true,
        messages: [
          { role: "system", content: systemMessage },
          ...reqBody
        ],
      })
    });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = completion.body.getReader();
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });
  
    return new Response(stream);
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
