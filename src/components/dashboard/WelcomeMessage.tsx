// components/dashboard/WelcomeMessage.tsx
type WelcomeMessageProps = {
    name: string;
  };
  
  export function WelcomeMessage({ name }: WelcomeMessageProps) {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? 'Good morning' :
      hour < 18 ? 'Good afternoon' :
      'Good evening';
  
    return (
      <div className="text-2xl font-semibold">
        {greeting}, {name}! 👋
      </div>
    );
  }
  