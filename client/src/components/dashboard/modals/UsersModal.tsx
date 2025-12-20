import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Shield, UserCog, Plus } from "lucide-react";

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockUsers = [
  { id: "1", name: "Marcus Vinicius", role: "Admin", initials: "MV" },
  { id: "2", name: "Ana Silva", role: "Editor", initials: "AS" },
  { id: "3", name: "Carlos Rodrigues", role: "Viewer", initials: "CR" },
  { id: "4", name: "Helena Santos", role: "Editor", initials: "HS" },
  { id: "5", name: "Rafael Lima", role: "Viewer", initials: "RL" },
];

export function UsersModal({ isOpen, onClose }: UsersModalProps) {
  return (
    <Modal
      id="users-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Usuários"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} data-testid="button-close-users">
            Fechar
          </Button>
          <Button data-testid="button-add-user">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </>
      }
    >
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
              data-testid={`user-item-${user.id}`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "Admin" && (
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Administrador
                      </span>
                    )}
                    {user.role === "Editor" && (
                      <span className="flex items-center gap-1">
                        <UserCog className="w-3 h-3" /> Editor
                      </span>
                    )}
                    {user.role === "Viewer" && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> Visualizador
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  user.role === "Admin"
                    ? "default"
                    : user.role === "Editor"
                      ? "secondary"
                      : "outline"
                }
                className="text-xs"
              >
                {user.role}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Modal>
  );
}
