import OpenAI from "openai";

export const conversation: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
  [
    {
      role: "user",
      content:
        "Hey LLM, I'm planning a trip to Japan and I'm super excited! Any tips?",
    },
    {
      role: "assistant",
      content:
        "That's wonderful! Japan is a beautiful country. Are you looking for travel tips, cultural advice, or something else?",
    },
    {
      role: "user",
      content: "Mainly travel tips, especially around Tokyo and Kyoto.",
    },
    {
      role: "assistant",
      content:
        "In Tokyo, don't miss exploring neighborhoods like Shibuya and Shinjuku. For Kyoto, I recommend visiting the historic temples, especially Kinkaku-ji. And try the local cuisine – sushi in Tokyo and kaiseki in Kyoto!",
    },
    {
      role: "user",
      content: "Awesome! What about language barriers?",
    },
    {
      role: "assistant",
      content:
        "Learning a few basic Japanese phrases can be very helpful. People appreciate when you make an effort to speak their language.",
    },
    {
      role: "user",
      content: "Got it. How about transportation? Is it easy to navigate?",
    },
    {
      role: "assistant",
      content:
        "Absolutely! Japan's public transportation is efficient and punctual. The Japan Rail Pass can be a great investment if you're traveling between cities.",
    },
    {
      role: "user",
      content:
        "That's helpful. Also, I'm a big anime fan. Any specific places related to anime that I should visit?",
    },
    {
      role: "assistant",
      content:
        "Definitely check out Akihabara in Tokyo. It's an anime and manga haven. You might also enjoy the Ghibli Museum in Mitaka.",
    },
    {
      role: "user",
      content: "Wow, thanks! Lastly, any etiquette tips I should be aware of?",
    },
    {
      role: "assistant",
      content:
        "Yes, it's important to be mindful of local customs. For instance, it's customary to remove your shoes when entering someone's home, and it's polite to bow when greeting someone.",
    },
    {
      role: "user",
      content: "This is all great advice, thank you so much!",
    },
    {
      role: "assistant",
      content:
        "You're welcome! Have an amazing trip to Japan and feel free to ask if you have more questions!",
    },
  ];
