"use client";

import { useEffect, useState } from 'react';
import { Loader2, Star, Flag, Eye, EyeOff, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/reviews/StarRating';
import type { BookingReview } from '@/lib/booking-reviews-data';

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<BookingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filterStatus, filterType]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('reviewType', filterType);
      params.append('limit', '100');

      const response = await fetch(`/api/bookings/reviews?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: 'published' | 'flagged' | 'hidden') => {
    setActioningId(reviewId);
    try {
      const response = await fetch(`/api/bookings/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update review status');

      toast({
        title: 'Success',
        description: `Review ${newStatus} successfully`,
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setActioningId(reviewToDelete);
    try {
      const response = await fetch(`/api/bookings/reviews/${reviewToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete review');

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });

      setShowDeleteDialog(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500">Flagged</Badge>;
      case 'hidden':
        return <Badge className="bg-red-500">Hidden</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hotel: 'bg-blue-500',
      car_rental: 'bg-purple-500',
      transfer: 'bg-orange-500',
      tour: 'bg-green-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.replace('_', ' ')}</Badge>;
  };

  const filteredReviews = reviews.filter(review => {
    if (filterStatus !== 'all' && review.status !== filterStatus) return false;
    if (filterType !== 'all' && review.reviewType !== filterType) return false;
    return true;
  });

  const stats = {
    total: reviews.length,
    published: reviews.filter(r => r.status === 'published').length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
    hidden: reviews.filter(r => r.status === 'hidden').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Management</h1>
        <p className="text-muted-foreground">
          Moderate and manage customer reviews across all booking types
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hidden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hidden}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="car_rental">Car Rental</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="tour">Tour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reviews found</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{review.userName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.ratings.overall} size={16} readonly />
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(review.status)}
                        {getTypeBadge(review.reviewType)}
                        {review.verified && <Badge variant="secondary">Verified</Badge>}
                      </div>
                    </div>

                    <p className="text-sm">{review.comment}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {review.status !== 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(review.id!, 'published')}
                          disabled={actioningId === review.id}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Publish
                        </Button>
                      )}
                      {review.status !== 'flagged' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(review.id!, 'flagged')}
                          disabled={actioningId === review.id}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag
                        </Button>
                      )}
                      {review.status !== 'hidden' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(review.id!, 'hidden')}
                          disabled={actioningId === review.id}
                        >
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setReviewToDelete(review.id!);
                          setShowDeleteDialog(true);
                        }}
                        disabled={actioningId === review.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

