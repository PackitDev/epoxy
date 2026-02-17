import { useState } from 'react';
import { useProjectStore } from '../stores/project-store';
import { SearchBar } from '../components/SearchBar';
import { PackageCard } from '../components/PackageCard';
import { Package, Star } from 'lucide-react';

const popularPackages = [
  { name: 'zod', version: '3.22.4', description: 'TypeScript-first schema declaration and validation' },
  { name: 'axios', version: '1.6.7', description: 'Promise based HTTP client for the browser and node.js' },
  { name: 'dotenv', version: '16.4.1', description: 'Loads environment variables from .env' },
  { name: 'cors', version: '2.8.5', description: 'Node.js CORS middleware' },
  { name: 'helmet', version: '7.1.0', description: 'Help secure Express apps with various HTTP headers' },
  { name: 'morgan', version: '1.10.0', description: 'HTTP request logger middleware for node.js' },
  { name: 'dayjs', version: '1.11.10', description: 'Tiny fast date library alternative to Moment.js' },
  { name: 'uuid', version: '9.0.0', description: 'RFC9562 UUIDs' },
  { name: 'lodash', version: '4.17.21', description: 'A modern JavaScript utility library' },
  { name: 'nanoid', version: '5.0.5', description: 'Tiny, secure, URL-friendly unique string ID generator' },
  { name: 'pino', version: '8.18.0', description: 'Super fast, all natural json logger' },
  { name: 'slugify', version: '1.6.6', description: 'Slugify a string' },
];

const categories = ['All', 'Frontend', 'Database', 'Auth', 'Utilities', 'Testing'];

export function Packages() {
  const packages = useProjectStore((s) => s.packages);
  const searchResults = useProjectStore((s) => s.searchResults);
  const searchPackages = useProjectStore((s) => s.searchPackages);
  const installPackage = useProjectStore((s) => s.installPackage);
  const removePackage = useProjectStore((s) => s.removePackage);
  const activeProject = useProjectStore((s) => s.activeProject);

  const [activeCategory, setActiveCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);

  const installedNames = new Set(packages.map((p) => p.name));

  const handleSearch = (query: string) => {
    setIsSearching(query.length >= 2);
    searchPackages(query);
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Package size={48} className="text-white/10 mb-4" />
        <h2 className="text-lg font-bold text-white/60">No Project Open</h2>
        <p className="text-sm text-white/30 mt-1">Open a project to browse and install packages</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Packages</h1>
        <p className="text-sm text-white/40 mt-0.5">Browse and install npm packages with one click</p>
      </div>

      <SearchBar
        placeholder="Search npm packages..."
        onSearch={handleSearch}
      />

      {/* Category filters */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isSearching ? (
        /* Search results */
        <div>
          <h2 className="text-sm font-semibold text-white/60 mb-3">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              No packages found. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((pkg) => (
                <PackageCard
                  key={pkg.name}
                  name={pkg.name}
                  version={pkg.version}
                  description={pkg.description}
                  isInstalled={installedNames.has(pkg.name)}
                  onInstall={() => installPackage(pkg.name, false)}
                  onRemove={() => removePackage(pkg.name)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Popular packages */
        <div>
          <h2 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <Star size={14} className="text-yellow-400" />
            Popular Packages
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {popularPackages.map((pkg) => (
              <PackageCard
                key={pkg.name}
                name={pkg.name}
                version={pkg.version}
                description={pkg.description}
                isInstalled={installedNames.has(pkg.name)}
                onInstall={() => installPackage(pkg.name, false)}
                onRemove={() => removePackage(pkg.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
