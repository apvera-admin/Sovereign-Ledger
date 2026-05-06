import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderPlus, Folder, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface ClientFolder {
  id: string;
  name: string;
  client_email?: string;
  created_at: string;
  document_count: number;
}

interface ClientFolderManagerProps {
  onFolderSelect: (folderId: string, folderName: string) => void;
  selectedFolderId?: string;
}

const ClientFolderManager: React.FC<ClientFolderManagerProps> = ({
  onFolderSelect,
  selectedFolderId
}) => {
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmail, setNewFolderEmail] = useState('');
  const { user } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('client_folders')
        .select(`
          *,
          documents:documents(count)
        `)
        .eq('trustee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const foldersWithCount = (data || []).map(folder => ({
        ...folder,
        document_count: folder.documents?.[0]?.count || 0
      }));
      
      setFolders(foldersWithCount);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: 'Error loading folders',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!user || !newFolderName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('client_folders')
        .insert({
          name: newFolderName.trim(),
          client_email: newFolderEmail.trim() || null,
          trustee_id: user.id
        });

      if (error) throw error;
      
      toast({
        title: 'Folder created',
        description: `Client folder "${newFolderName}" has been created.`,
      });
      
      setNewFolderName('');
      setNewFolderEmail('');
      setShowCreateDialog(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error creating folder',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const deleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete the folder "${folderName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('client_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
      
      toast({
        title: 'Folder deleted',
        description: `Client folder "${folderName}" has been deleted.`,
      });
      
      fetchFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: 'Error deleting folder',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C8963C]" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Client Folders
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Client Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter client name or folder name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email (Optional)</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newFolderEmail}
                    onChange={(e) => setNewFolderEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="border-[rgba(200,150,60,0.4)] text-[#C8963C] hover:bg-[rgba(200,150,60,0.1)]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createFolder} 
                    disabled={!newFolderName.trim()}
                    className="bg-[#C8963C] hover:bg-[#D4A84A] text-[#0C0D11] font-bold"
                  >
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {folders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No client folders yet. Create one to organize documents.
            </p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-[rgba(200,150,60,0.08)] border-[rgba(200,150,60,0.2)]'
                    : 'hover:bg-[rgba(255,255,255,0.03)]'
                }`}
                onClick={() => onFolderSelect(folder.id, folder.name)}
              >
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-[#C8963C]" />
                  <div>
                    <div className="font-medium">{folder.name}</div>
                    {folder.client_email && (
                      <div className="text-sm text-muted-foreground">
                        {folder.client_email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {folder.document_count}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id, folder.name);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFolderManager;