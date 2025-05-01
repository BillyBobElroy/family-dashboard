// components/dashboard/WeatherWidget.tsx
type WeatherWidgetProps = {
    location: string;
  };
  
  export function WeatherWidget({ location }: WeatherWidgetProps) {
    // Replace this with real weather API later
    const temp = 72;
    const condition = 'Partly Cloudy';
  
    return (
      <div className="p-4 bg-blue-50 border rounded-xl shadow-sm">
        <div className="text-lg font-medium mb-1">Weather – {location}</div>
        <div className="text-4xl font-bold">{temp}°F</div>
        <div className="text-sm text-gray-600">{condition}</div>
      </div>
    );
  }
  