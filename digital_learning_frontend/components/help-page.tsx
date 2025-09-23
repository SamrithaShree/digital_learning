
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { NavigationHeader } from "@/components/navigation-header"
import { Search, Phone, Mail, MessageCircle, Book, Video, Users } from "lucide-react"

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("")
  const [language, setLanguage] = useState("english")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [chatInput, setChatInput] = useState("")

  const helpCategories = [
    {
      icon: <Book className="h-5 w-5" />,
      title: language === "hindi" ? "पाठ और सामग्री" : language === "punjabi" ? "ਪਾਠ ਅਤੇ ਸਮੱਗਰੀ" : "Lessons & Content",
      count: 12,
    },
    {
      icon: <Video className="h-5 w-5" />,
      title: language === "hindi" ? "वीडियो और ऑडियो" : language === "punjabi" ? "ਵੀਡੀਓ ਅਤੇ ਆਡੀਓ" : "Video & Audio",
      count: 8,
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: language === "hindi" ? "खाता और प्रोफाइल" : language === "punjabi" ? "ਖਾਤਾ ਅਤੇ ਪ੍ਰੋਫਾਈਲ" : "Account & Profile",
      count: 6,
    },
  ]

  const faqs = [
    {
      question:
        language === "hindi"
          ? "मैं अपना पासवर्ड कैसे रीसेट करूं?"
          : language === "punjabi"
            ? "ਮੈਂ ਆਪਣਾ ਪਾਸਵਰਡ ਕਿਵੇਂ ਰੀਸੈਟ ਕਰਾਂ?"
            : "How do I reset my password?",
      answer:
        language === "hindi"
          ? 'लॉगिन पेज पर "पासवर्ड भूल गए?" लिंक पर क्लिक करें और अपना ईमेल दर्ज करें।'
          : language === "punjabi"
            ? 'ਲਾਗਇਨ ਪੇਜ ਤੇ "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?" ਲਿੰਕ ਤੇ ਕਲਿੱਕ ਕਰੋ ਅਤੇ ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ।'
            : 'Click on "Forgot Password?" link on the login page and enter your email address.',
    },
    {
      question:
        language === "hindi"
          ? "ऑफलाइन मोड कैसे काम करता है?"
          : language === "punjabi"
            ? "ਆਫਲਾਈਨ ਮੋਡ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?"
            : "How does offline mode work?",
      answer:
        language === "hindi"
          ? "पाठों को डाउनलोड करें और बिना इंटरनेट के भी सीख सकते हैं। आपकी प्रगति अगली बार इंटरनेट कनेक्ट होने पर सिंक हो जाएगी।"
          : language === "punjabi"
            ? "ਪਾਠਾਂ ਨੂੰ ਡਾਊਨਲੋਡ ਕਰੋ ਅਤੇ ਬਿਨਾਂ ਇੰਟਰਨੈਟ ਦੇ ਵੀ ਸਿੱਖ ਸਕਦੇ ਹੋ। ਤੁਹਾਡੀ ਤਰੱਕੀ ਅਗਲੀ ਵਾਰ ਇੰਟਰਨੈਟ ਕਨੈਕਟ ਹੋਣ ਤੇ ਸਿੰਕ ਹੋ ਜਾਵੇਗੀ।"
            : "Download lessons and learn without internet. Your progress will sync when you connect to internet next time.",
    },
    {
      question:
        language === "hindi"
          ? "मैं अपनी भाषा कैसे बदलूं?"
          : language === "punjabi"
            ? "ਮੈਂ ਆਪਣੀ ਭਾਸ਼ਾ ਕਿਵੇਂ ਬਦਲਾਂ?"
            : "How do I change my language?",
      answer:
        language === "hindi"
          ? "प्रोफाइल सेटिंग्स में जाकर अपनी पसंदीदा भाषा चुनें - हिंदी, पंजाबी या अंग्रेजी।"
          : language === "punjabi"
            ? "ਪ੍ਰੋਫਾਈਲ ਸੈਟਿੰਗਜ਼ ਵਿੱਚ ਜਾ ਕੇ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ - ਹਿੰਦੀ, ਪੰਜਾਬੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ।"
            : "Go to Profile Settings and choose your preferred language - Hindi, Punjabi, or English.",
    },
    {
      question:
        language === "hindi"
          ? "क्या मैं अपने दोस्तों के साथ प्रगति साझा कर सकता हूं?"
          : language === "punjabi"
            ? "ਕੀ ਮੈਂ ਆਪਣੇ ਦੋਸਤਾਂ ਨਾਲ ਤਰੱਕੀ ਸਾਂਝੀ ਕਰ ਸਕਦਾ ਹਾਂ?"
            : "Can I share my progress with friends?",
      answer:
        language === "hindi"
          ? "हां, आप अपनी उपलब्धियां और बैज दोस्तों के साथ साझा कर सकते हैं।"
          : language === "punjabi"
            ? "ਹਾਂ, ਤੁਸੀਂ ਆਪਣੀਆਂ ਪ੍ਰਾਪਤੀਆਂ ਅਤੇ ਬੈਜ ਦੋਸਤਾਂ ਨਾਲ ਸਾਂਝੇ ਕਰ ਸਕਦੇ ਹੋ।"
            : "Yes, you can share your achievements and badges with friends.",
    },
  ]

  const startChat = () => {
    setIsChatOpen(true)
    setChatMessages([
      {
        text:
          language === "hindi"
            ? "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूं?"
            : language === "punjabi"
              ? "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?"
              : "Hello! How can I help you today?",
        isUser: false,
      },
    ])
  }

  const sendMessage = () => {
    if (!chatInput.trim()) return

    setChatMessages((prev) => [
      ...prev,
      { text: chatInput, isUser: true },
      {
        text:
          language === "hindi"
            ? "धन्यवाद! हमारी टीम जल्द ही आपसे संपर्क करेगी।"
            : language === "punjabi"
              ? "ਧੰਨਵਾਦ! ਸਾਡੀ ਟੀਮ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੇਗੀ।"
              : "Thank you! Our team will contact you shortly.",
        isUser: false,
      },
    ])
    setChatInput("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      <NavigationHeader
        title={language === "hindi" ? "सहायता केंद्र" : language === "punjabi" ? "ਸਹਾਇਤਾ ਕੇਂਦਰ" : "Help Center"}
        backUrl="/student/dashboard"
      />

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-gray-600 mb-6">
              {language === "hindi"
                ? "आपके सवालों के जवाब और सहायता"
                : language === "punjabi"
                  ? "ਤੁਹਾਡੇ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਅਤੇ ਸਹਾਇਤਾ"
                  : "Find answers to your questions and get support"}
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={
                  language === "hindi"
                    ? "सहायता खोजें..."
                    : language === "punjabi"
                      ? "ਸਹਾਇਤਾ ਖੋਜੋ..."
                      : "Search for help..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {helpCategories.map((category, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg">{category.icon}</div>
                    <div>
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="text-sm text-gray-600">
                        {category.count} {language === "hindi" ? "लेख" : language === "punjabi" ? "ਲੇਖ" : "articles"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "hindi"
                      ? "अक्सर पूछे जाने वाले प्रश्न"
                      : language === "punjabi"
                        ? "ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ"
                        : "Frequently Asked Questions"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "hindi" ? "संपर्क सहायता" : language === "punjabi" ? "ਸੰਪਰਕ ਸਹਾਇਤਾ" : "Contact Support"}
                  </CardTitle>
                  <CardDescription>
                    {language === "hindi"
                      ? "अभी भी मदद चाहिए? हमसे संपर्क करें"
                      : language === "punjabi"
                        ? "ਅਜੇ ਵੀ ਮਦਦ ਚਾਹੀਦੀ? ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ"
                        : "Still need help? Get in touch with us"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">
                        {language === "hindi" ? "फोन सहायता" : language === "punjabi" ? "ਫੋਨ ਸਹਾਇਤਾ" : "Phone Support"}
                      </p>
                      <p className="text-sm text-gray-600">+91-1800-XXX-XXXX</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">
                        {language === "hindi" ? "ईमेल सहायता" : language === "punjabi" ? "ਈਮੇਲ ਸਹਾਇਤਾ" : "Email Support"}
                      </p>
                      <p className="text-sm text-gray-600">help@rurallearning.in</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">
                        {language === "hindi" ? "लाइव चैट" : language === "punjabi" ? "ਲਾਈਵ ਚੈਟ" : "Live Chat"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {language === "hindi"
                          ? "सोमवार-शुक्रवार, 9AM-6PM"
                          : language === "punjabi"
                            ? "ਸੋਮਵਾਰ-ਸ਼ੁੱਕਰਵਾਰ, 9AM-6PM"
                            : "Monday-Friday, 9AM-6PM"}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={startChat}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {language === "hindi" ? "चैट शुरू करें" : language === "punjabi" ? "ਚੈਟ ਸ਼ੁਰੂ ਕਰੋ" : "Start Chat"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {isChatOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md h-96">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {language === "hindi" ? "लाइव चैट" : language === "punjabi" ? "ਲਾਈਵ ਚੈਟ" : "Live Chat"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                    ×
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg ${msg.isUser ? "bg-orange-100 ml-4" : "bg-gray-100 mr-4"}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        language === "hindi" ? "संदेश लिखें..." : language === "punjabi" ? "ਸੁਨੇਹਾ ਲਿਖੋ..." : "Type message..."
                      }
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage}>
                      {language === "hindi" ? "भेजें" : language === "punjabi" ? "ਭੇਜੋ" : "Send"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
