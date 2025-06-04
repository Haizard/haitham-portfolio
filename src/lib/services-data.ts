
export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
}

let services: Service[] = [
  { id: "1", name: "1-on-1 Coaching Session", price: "150", duration: "60 min", description: "Personalized coaching to help you achieve your goals." },
  { id: "2", name: "Content Strategy Blueprint", price: "499", duration: "Project", description: "A comprehensive content strategy tailored to your brand." },
  { id: "3", name: "Video Editing Package", price: "250", duration: "Per Video", description: "Professional video editing for up to 10 mins of footage." },
];

export function getAllServices(): Service[] {
  return services;
}

export function getServiceById(id: string): Service | undefined {
  return services.find(service => service.id === id);
}

export function addService(service: Omit<Service, 'id'>): Service {
  const newService: Service = { 
    id: (Math.random() + 1).toString(36).substring(7), // simple unique id
    ...service 
  };
  services.push(newService);
  return newService;
}

export function updateService(id: string, updates: Partial<Omit<Service, 'id'>>): Service | undefined {
  const serviceIndex = services.findIndex(service => service.id === id);
  if (serviceIndex === -1) {
    return undefined;
  }
  services[serviceIndex] = { ...services[serviceIndex], ...updates };
  return services[serviceIndex];
}

export function deleteService(id: string): boolean {
  const initialLength = services.length;
  services = services.filter(service => service.id !== id);
  return services.length < initialLength;
}
