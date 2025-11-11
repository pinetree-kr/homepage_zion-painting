import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';
import { mockPosts } from '../../utils/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface GallerySectionProps {
  searchTerm: string;
}

export function GallerySection({ searchTerm }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const galleries = mockPosts
    .filter(post => post.type === 'gallery' && post.status === 'published')
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <>
      {galleries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery, index) => (
            <motion.div
              key={gallery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/photo-${1600000000000 + index}?w=800&h=600&fit=crop`}
                      alt={gallery.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => setSelectedImage(gallery)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white"
                      >
                        <ZoomIn className="h-6 w-6 text-gray-900" />
                      </button>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 border-0">
                        Gallery
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 mb-2">{gallery.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {gallery.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {gallery.createdAt}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No gallery items found</p>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl p-4"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-video bg-gray-100">
                  <ImageWithFallback
                    src={`https://images.unsplash.com/photo-${1600000000000}?w=1200&h=800&fit=crop`}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-900" />
                  </button>
                </div>
                <div className="p-6">
                  <h2 className="text-gray-900 mb-2">{selectedImage.title}</h2>
                  <p className="text-gray-700 mb-4">{selectedImage.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>By {selectedImage.author}</span>
                    <span>•</span>
                    <span>{selectedImage.createdAt}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
