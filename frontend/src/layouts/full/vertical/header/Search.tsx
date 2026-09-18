import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import SidebarContent, { ChildItem, MenuItem } from '../sidebar/sidebaritems';
import { Link } from 'react-router';
import SimpleBar from 'simplebar-react';
import { Input } from 'src/components/ui/input';

interface SearchResult {
  name: string
  url: string
  path: string | undefined
  icon?: string
}

function Search() {
  const [query, setQuery] = useState('');

  // 🔍 Recursive search through menu
  const searchItems = (items: (MenuItem | ChildItem)[], q: string, parentPath = ''): SearchResult[] => {
    let results: SearchResult[] = [];

    items.forEach((item) => {
      const currentPath = parentPath ? `${parentPath} → ${item.name}` : item.name;

      // If match found
      if (item.name?.toLowerCase().includes(q.toLowerCase()) && item.url) {
        results.push({
          name: item.name,
          url: item.url,
          path: currentPath,
          icon: item.icon,
        });
      }

      // Search deeper children
      if (item.children) {
        results = [...results, ...searchItems(item.children, q, currentPath)];
      }
    });

    return results;
  };

  // Memoize filtered results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchItems(SidebarContent, query);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="flex items-center relative lg:w-xs mx-auto ">
        <Icon
          icon="solar:magnifer-linear"
          width="18"
          height="18"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        />

        <Input
          placeholder="Search...."
          className="rounded-xl pl-10"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div
        className={`absolute w-full bg-background rounded-md top-11 z-10 start-0 shadow-md border border-border ${
          Boolean(query) ? 'block' : 'hidden'
        }`}
      >
        <SimpleBar className="h-72 p-4 custom-scroll">
          {Boolean(results.length) ? (
            results.map((item, i) => (
              <Link
                key={i}
                to={item.url}
                onClick={() => setQuery('')}
                className="p-2 mb-1.5 last:mb-0 flex items-center bg-input/30 gap-2 text-sm font-medium rounded-md hover:bg-primary/20 hover:text-primary w-full"
              >
                <div className="flex items-center">
                  <Icon icon="iconoir:component" width={18} height={18} />
                  <div className="ps-3">
                    <h5 className="mb-1 text-sm group-hover/link:text-primary">{item.name}</h5>
                    <span className="text-xs block truncate text-muted-foreground">{item.path}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-medium font-medium text-foreground">No Components Found!</h1>
            </div>
          )}
        </SimpleBar>
      </div>
    </div>
  );
}

export default Search;
