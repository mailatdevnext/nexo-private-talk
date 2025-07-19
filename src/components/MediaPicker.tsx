
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Smile, Image, X } from "lucide-react";

interface MediaPickerProps {
  onStickerSelect: (sticker: string) => void;
  onGifSelect: (gif: string) => void;
  onClose: () => void;
}

export const MediaPicker = ({ onStickerSelect, onGifSelect, onClose }: MediaPickerProps) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'gifs'>('stickers');
  const [searchQuery, setSearchQuery] = useState("");

  // Sample stickers
  const stickers = [
    "😀", "😂", "🥰", "😍", "🤔", "😎", "🙄", "😴", 
    "🤗", "🎉", "👍", "❤️", "🔥", "⭐", "💯", "🚀",
    "👋", "🤝", "💪", "🙏", "😊", "😋", "🤣", "😭",
    "🥳", "🤩", "😘", "🤪", "🥺", "😇", "🤭", "🤫"
  ];

  // Sample GIFs
  const gifs = [
    "https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif",
    "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    "https://media.giphy.com/media/3o7abKGM3Xa70I7jCE/giphy.gif",
    "https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif",
    "https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif",
    "https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif",
  ];

  const filteredStickers = stickers.filter(() => true);
  const filteredGifs = gifs.filter(() => true);

  return (
    <div className="absolute bottom-16 left-0 right-0 bg-gray-900 border border-gray-700 rounded-t-xl shadow-2xl max-h-64 overflow-hidden mx-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'stickers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stickers')}
            className={activeTab === 'stickers' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }
          >
            <Smile className="h-4 w-4 mr-2" />
            Stickers
          </Button>
          <Button
            variant={activeTab === 'gifs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('gifs')}
            className={activeTab === 'gifs' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }
          >
            <Image className="h-4 w-4 mr-2" />
            GIFs
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 max-h-40 overflow-y-auto">
        {activeTab === 'stickers' ? (
          <div className="grid grid-cols-8 gap-2">
            {filteredStickers.map((sticker, index) => (
              <button
                key={index}
                className="text-2xl hover:bg-gray-800 rounded-lg p-2 transition-colors duration-200 hover:scale-110 transform"
                onClick={() => {
                  onStickerSelect(sticker);
                  onClose();
                }}
              >
                {sticker}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredGifs.map((gif, index) => (
              <button
                key={index}
                className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-all duration-200 hover:scale-105 transform border border-gray-700"
                onClick={() => {
                  onGifSelect(gif);
                  onClose();
                }}
              >
                <img
                  src={gif}
                  alt={`GIF ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
