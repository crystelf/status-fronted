# Tag Filter and Group View Components

This document describes the TagFilter and GroupView components for the System Monitor frontend.

## Components

### TagFilter

The `TagFilter` component displays available tags and allows users to select multiple tags to filter the client list.

**Requirements**: 10.1, 10.3

**Props**:
- `tags: string[]` - Array of all available tags
- `selectedTags: string[]` - Array of currently selected tags
- `onTagSelect: (tags: string[]) => void` - Callback when tag selection changes

**Features**:
- Multi-select functionality
- Visual indication of selected tags
- "Clear all" button when tags are selected
- Smooth animations on tag appearance and selection
- Responsive design

**Usage**:
```tsx
import { TagFilter } from '@/components/tag-filter'

function MyComponent() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const allTags = ['production', 'development', 'web', 'database']

  return (
    <TagFilter
      tags={allTags}
      selectedTags={selectedTags}
      onTagSelect={setSelectedTags}
    />
  )
}
```

### GroupView

The `GroupView` component displays clients grouped by tags, purpose, or platform with collapsible sections.

**Requirements**: 10.2, 10.4

**Props**:
- `clients: ClientSummary[]` - Array of clients to display
- `groupBy: 'tags' | 'purpose' | 'platform'` - Grouping criteria
- `onClientClick?: (clientId: string) => void` - Optional callback when a client card is clicked

**Features**:
- Group by tags, purpose, or platform
- Collapsible group sections
- Client count per group
- Smooth expand/collapse animations
- Responsive grid layout within groups
- Clients without tags/purpose are grouped under "Uncategorized"/"Unspecified Purpose"

**Grouping Behavior**:
- **By Tags**: Clients can appear in multiple groups if they have multiple tags
- **By Purpose**: Clients are grouped by their purpose field
- **By Platform**: Clients are grouped by their operating system

**Usage**:
```tsx
import { GroupView } from '@/components/group-view'

function MyComponent() {
  const clients = [...] // Array of ClientSummary
  const [groupBy, setGroupBy] = useState<'tags' | 'purpose' | 'platform'>('tags')

  return (
    <GroupView
      clients={clients}
      groupBy={groupBy}
      onClientClick={(id) => console.log('Clicked:', id)}
    />
  )
}
```

## Complete Example

See `tag-filter.example.tsx` for a complete working example that demonstrates:
- Extracting unique tags from clients
- Filtering clients based on selected tags
- Switching between different grouping modes
- Displaying filtered and grouped results

## Integration with Dashboard

To integrate these components into the main dashboard:

1. **Extract all unique tags** from the client list
2. **Manage selected tags state** at the dashboard level
3. **Filter clients** based on selected tags
4. **Allow users to switch** between grouping modes
5. **Pass filtered clients** to GroupView component

Example integration:
```tsx
function Dashboard() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<'tags' | 'purpose' | 'platform'>('tags')

  // Extract unique tags
  const allTags = Array.from(
    new Set(clients.flatMap(c => c.clientTags || []))
  ).sort()

  // Filter clients
  const filteredClients = selectedTags.length === 0
    ? clients
    : clients.filter(c => c.clientTags?.some(t => selectedTags.includes(t)))

  return (
    <div>
      <TagFilter
        tags={allTags}
        selectedTags={selectedTags}
        onTagSelect={setSelectedTags}
      />
      
      <GroupView
        clients={filteredClients}
        groupBy={groupBy}
        onClientClick={handleClientClick}
      />
    </div>
  )
}
```

## Styling

Both components use:
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Custom theme colors from globals.css

The components automatically adapt to light/dark mode through CSS variables.

## Accessibility

- Buttons have proper hover and focus states
- Semantic HTML elements are used
- Icons have appropriate aria-labels where needed
- Keyboard navigation is supported

## Performance Considerations

- Tag filtering is done client-side for instant feedback
- Group calculations are memoized through React's rendering
- Animations use GPU-accelerated properties
- Large client lists may benefit from virtualization (future enhancement)
