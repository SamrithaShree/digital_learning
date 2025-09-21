import { NextResponse } from "next/server"

const achievements = [
  {
    id: "1",
    title: "First Steps",
    titleHi: "पहले कदम",
    titlePa: "ਪਹਿਲੇ ਕਦਮ",
    description: "Complete your first lesson",
    descriptionHi: "अपना पहला पाठ पूरा करें",
    descriptionPa: "ਆਪਣਾ ਪਹਿਲਾ ਪਾਠ ਪੂਰਾ ਕਰੋ",
    icon: "🎯",
    earned: false,
    progress: 0,
  },
  {
    id: "2",
    title: "Digital Explorer",
    titleHi: "डिजिटल खोजकर्ता",
    titlePa: "ਡਿਜੀਟਲ ਖੋਜੀ",
    description: "Complete 5 lessons",
    descriptionHi: "5 पाठ पूरे करें",
    descriptionPa: "5 ਪਾਠ ਪੂਰੇ ਕਰੋ",
    icon: "🚀",
    earned: false,
    progress: 0,
  },
  {
    id: "3",
    title: "Safety Champion",
    titleHi: "सुरक्षा चैंपियन",
    titlePa: "ਸੁਰੱਖਿਆ ਚੈਂਪੀਅਨ",
    description: "Master internet safety",
    descriptionHi: "इंटरनेट सुरक्षा में महारत हासिल करें",
    descriptionPa: "ਇੰਟਰਨੈੱਟ ਸੁਰੱਖਿਆ ਵਿੱਚ ਮਾਹਰ ਬਣੋ",
    icon: "🛡️",
    earned: false,
    progress: 0,
  },
]

export async function GET() {
  return NextResponse.json(achievements)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { achievementId, progress } = body

  const achievement = achievements.find((a) => a.id === achievementId)
  if (achievement) {
    achievement.progress = progress
    if (progress >= 100) {
      achievement.earned = true
    }
    return NextResponse.json({ success: true, achievement })
  }

  return NextResponse.json({ success: false }, { status: 400 })
}
