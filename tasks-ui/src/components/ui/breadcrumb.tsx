import { Link } from "wouter";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items.length) return null;

  return (
    <nav className="text-sm mb-4">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground">/</span>
              )}
              
              {isLast || !item.href ? (
                <span className={`${isLast ? 'font-medium' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-primary hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}