import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { mockPosts } from '../../utils/mockData';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface QnASectionProps {
  searchTerm: string;
}

export function QnASection({ searchTerm }: QnASectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const qnas = mockPosts
    .filter(post => post.type === 'qna' && post.status === 'published')
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-teal-500 hover:bg-teal-600">
          <MessageCircle className="h-4 w-4 mr-2" />
          Ask a Question
        </Button>
      </div>

      {qnas.length > 0 ? (
        <div className="space-y-2">
          {qnas.map(qna => {
            const isAnswered = qna.id === '3'; // Mock answered status
            return (
              <Card key={qna.id} className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleExpand(qna.id)}
                    className="w-full px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {isAnswered ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-gray-900 text-base">{qna.title}</h3>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                            expandedId === qna.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{qna.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{qna.createdAt}</span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={
                            isAnswered
                              ? 'bg-green-50 text-green-700 border-0'
                              : 'bg-yellow-50 text-yellow-700 border-0'
                          }
                        >
                          {isAnswered ? 'Answered' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedId === qna.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100 space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Question:</p>
                            <p className="text-gray-700 whitespace-pre-wrap">{qna.content}</p>
                          </div>
                          {isAnswered && (
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-xs text-green-700 mb-2">Answer:</p>
                              <p className="text-gray-700">
                                Thank you for your question. We have reviewed your inquiry and will provide detailed information shortly. Please check back soon for updates.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Answered by Admin • {qna.createdAt}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No questions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
