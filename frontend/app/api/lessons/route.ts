import { NextResponse } from "next/server"

// Mock database - in production, use a real database
const lessons = [
  {
    id: "1",
    title: "Introduction to Computers",
    titleHi: "कंप्यूटर का परिचय",
    titlePa: "ਕੰਪਿਊਟਰ ਦੀ ਜਾਣ-ਪਛਾਣ",
    description: "Learn the basics of computers and how they work",
    descriptionHi: "कंप्यूटर की मूल बातें और उनका काम सीखें",
    descriptionPa: "ਕੰਪਿਊਟਰ ਦੀਆਂ ਬੁਨਿਆਦੀ ਗੱਲਾਂ ਅਤੇ ਉਹਨਾਂ ਦਾ ਕੰਮ ਸਿੱਖੋ",
    duration: 15,
    completed: false,
    difficulty: "beginner",
    category: "Digital Literacy",
    categoryHi: "डिजिटल साक्षरता",
    categoryPa: "ਡਿਜੀਟਲ ਸਾਖਰਤਾ",
  },
  {
    id: "2",
    title: "Using the Internet Safely",
    titleHi: "इंटरनेट का सुरक्षित उपयोग",
    titlePa: "ਇੰਟਰਨੈੱਟ ਦੀ ਸੁਰੱਖਿਅਤ ਵਰਤੋਂ",
    description: "Stay safe online and protect your personal information",
    descriptionHi: "ऑनलाइन सुरक्षित रहें और अपनी व्यक्तिगत जानकारी की सुरक्षा करें",
    descriptionPa: "ਔਨਲਾਈਨ ਸੁਰੱਖਿਅਤ ਰਹੋ ਅਤੇ ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਦੀ ਸੁਰੱਖਿਆ ਕਰੋ",
    duration: 20,
    completed: false,
    difficulty: "beginner",
    category: "Internet Safety",
    categoryHi: "इंटरनेट सुरक्षा",
    categoryPa: "ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ",
  },
  {
    id: "3",
    title: "Creating Documents",
    titleHi: "दस्तावेज़ बनाना",
    titlePa: "ਦਸਤਾਵੇਜ਼ ਬਣਾਉਣਾ",
    description: "Learn to create and format text documents",
    descriptionHi: "टेक्स्ट दस्तावेज़ बनाना और फॉर्मेट करना सीखें",
    descriptionPa: "ਟੈਕਸਟ ਦਸਤਾਵੇਜ਼ ਬਣਾਉਣਾ ਅਤੇ ਫਾਰਮੈਟ ਕਰਨਾ ਸਿੱਖੋ",
    duration: 25,
    completed: false,
    difficulty: "intermediate",
    category: "Office Skills",
    categoryHi: "कार्यालय कौशल",
    categoryPa: "ਦਫਤਰੀ ਹੁਨਰ",
  },
]

export async function GET() {
  return NextResponse.json(lessons)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, lessonId } = body

  if (action === "complete") {
    const lesson = lessons.find((l) => l.id === lessonId)
    if (lesson) {
      lesson.completed = true
      return NextResponse.json({ success: true, lesson })
    }
  }

  if (action === "start") {
    const lesson = lessons.find((l) => l.id === lessonId)
    if (lesson) {
      return NextResponse.json({ success: true, lesson })
    }
  }

  return NextResponse.json({ success: false }, { status: 400 })
}
