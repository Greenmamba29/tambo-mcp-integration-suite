import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Calendar, MessageCircle, UserPlus } from 'lucide-react';

export interface UserProfileProps {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away';
  phone?: string;
  location?: string;
  joinDate?: string;
  bio?: string;
  compact?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatar,
  role,
  status = 'offline',
  phone,
  location,
  joinDate,
  bio,
  compact = false
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'away':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <Card className="gradient-card shadow-card hover:shadow-elegant transition-smooth">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="gradient-primary text-white">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor()}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{role || email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-card hover:shadow-elegant transition-smooth">
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="gradient-primary text-white text-lg">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor()}`} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{name}</CardTitle>
            {role && (
              <CardDescription className="text-primary font-medium">
                {role}
              </CardDescription>
            )}
            <Badge variant="outline" className="mt-2 capitalize">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {bio && (
          <p className="text-sm text-muted-foreground">{bio}</p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{email}</span>
          </div>
          
          {phone && (
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{phone}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{location}</span>
            </div>
          )}
          
          {joinDate && (
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined {joinDate}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-4">
          <Button variant="default" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};