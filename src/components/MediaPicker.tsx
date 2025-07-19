
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Smile, Image } from "lucide-react";

interface MediaPickerProps {
  onStickerSelect: (sticker: string) => void;
  onGifSelect: (gif: string) => void;
  onClose: () => void;
}

export const MediaPicker = ({ onStickerSelect, onGifSelect, onClose }: MediaPickerProps) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'gifs'>('stickers');
  const [searchQuery, setSearchQuery] = useState("");

  // Sample stickers (in a real app, these would come from an API)
  const stickers = [
    "😀", "😂", "🥰", "😍", "🤔", "😎", "🙄", "😴", 
    "🤗", "🎉", "👍", "❤️", "🔥", "⭐", "💯", "🚀",
    "👋", "🤝", "💪", "🙏", "😊", "😋", "🤣", "😭"
  ];

  // Sample GIFs (in a real app, these would come from Giphy API)
  const gifs = [
    "https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif",
    "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    "https://media.giphy.com/media/3o7abKGM3Xa70I7jCE/giphy.gif",
    "https://media.giphy.com/media/26AHPxxnSw1L9T1rW/giphy.gif",
    "https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif",
    "https://media.giphy.com/media/26gsjCZpPolPr3sBy/giphy.gif",
  ];

  const filteredStickers = stickers.filter(() => true); // In real app, filter by searchQuery
  const filteredGifs = gifs.filter(() => true); // In real app, filter by searchQuery

  return (
    <div className="absolute bottom-16 left-0 right-0 bg-card border border-border rounded-t-lg shadow-lg max-h-64 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'stickers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stickers')}
          >
            <Smile className="h-4 w-4 mr-1" />
            Stickers
          </Button>
          <Button
            variant={activeTab === 'gifs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('gifs')}
          >
            <Image className="h-4 w-4 mr-1" />
            GIFs
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
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
                className="text-2xl hover:bg-accent rounded p-1 transition-colors"
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
                className="aspect-square rounded overflow-hidden hover:opacity-80 transition-opacity"
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
