import PageLayout from "@/components/PageLayout"
import AvatarCreator from "@/components/avatar/AvatarCreator"

export default function AvatarPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              GOLD Avatar Creator
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Customize your unique GOLD-inspired avatar and join the Goldium community
          </p>
        </div>

        <AvatarCreator />
      </div>
    </PageLayout>
  )
}
