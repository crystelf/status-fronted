'use client'

import { motion } from 'framer-motion'
import { Tag, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onTagSelect: (tags: string[]) => void
}

/**
 * TagFilter Component
 * Displays available tags and allows multi-selection for filtering clients
 * Requirements: 10.1, 10.3
 */
export function TagFilter({ tags, selectedTags, onTagSelect }: TagFilterProps) {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag from selection
      onTagSelect(selectedTags.filter(t => t !== tag))
    } else {
      // Add tag to selection
      onTagSelect([...selectedTags, tag])
    }
  }

  const handleClearAll = () => {
    onTagSelect([])
  }

  // If no tags available, don't render anything
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-foreground-secondary" />
          <h3 className="text-sm font-medium text-foreground-secondary">
            标签筛选
          </h3>
        </div>
        
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            清除全部
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag)
          
          return (
            <motion.button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md',
                'border transition-all duration-200',
                'hover:shadow-sm',
                isSelected
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-primary/50'
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.03,
                ease: 'easeOut'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Tag className="w-3.5 h-3.5" />
              {tag}
            </motion.button>
          )
        })}
      </div>

      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-foreground-secondary"
        >
          已选择 {selectedTags.length} 个标签
        </motion.div>
      )}
    </div>
  )
}
