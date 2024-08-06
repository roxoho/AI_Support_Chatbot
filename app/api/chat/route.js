import { NextResponse } from "next/server";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const systemMessage = `
Welcome to Pantry Easy Customer Support! We're here to help you get the most out of your pantry management experience. Below is an overview of our system and key features to assist you:

Overview:
Pantry Easy is an advanced pantry management system designed to simplify and enhance your kitchen organization. Our platform uses cutting-edge AI technologies to provide intelligent suggestions, automatic image classification, and other smart features to streamline your pantry management.
Key Features:
AI Suggestions: Receive personalized suggestions for recipes, meal planning, and grocery lists based on the items in your pantry.
Auto Image Classification: Effortlessly add items to your pantry by taking a photo. Our AI will automatically recognize and classify the items for you.
Inventory Management: Keep track of your pantry inventory with real-time updates and notifications for expiring items.
Shopping Lists: Create and manage shopping lists easily. Sync them with your inventory for a seamless shopping experience.
User-Friendly Interface: Navigate through our intuitive interface designed for ease of use on both desktop and mobile devices.
Integration: Integrate with other smart home devices and apps for a more connected kitchen experience.
How Can We Help You?
Getting Started: New to Pantry Easy? Our getting started guide will help you set up your pantry and explore our features.
Account Management: Need help with your account settings, subscriptions, or user profiles? Find answers to common account-related questions.
Troubleshooting: Encountering issues? Our troubleshooting section covers common problems and their solutions.
Feature Assistance: Learn how to make the most of our AI suggestions, auto image classification, and other features.
Feedback and Support: Have suggestions or need further assistance? Contact our support team, and we'll be happy to help.
Contact Us:
Email: exampleSupport@pantryeasy.com
Phone: 1-800-PANTRY-EZ (12345678910)
Live Chat: Available 24/7 on our website
Thank you for choosing Pantry Easy! We're committed to making your pantry management simple, smart, and efficient.
`;

export async function POST(req) {
  try {
    const reqBody = await req.json();

     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
       headers: {
         "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
         "Content-Type": "application/json"
       },
       body: JSON.stringify({
         model: "qwen/qwen-2-7b-instruct:free",
         messages: [
           { role: "system", content: systemMessage },
           ...reqBody
         ],
       })
     });

     const data = await response.json();
     
     return NextResponse.json({message: data.choices[0].message.content},{status: 200});


  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
