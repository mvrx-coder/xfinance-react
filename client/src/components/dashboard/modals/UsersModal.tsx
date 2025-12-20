import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Shield, UserCog, Plus, Mail, MoreHorizontal } from "lucide-react";

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockUsers = [
  { id: "1", name: "Marcus Vinicius", email: "marcus@xfinance.com", role: "Admin", initials: "MV", status: "online" },
  { id: "2", name: "Ana Silva", email: "ana@xfinance.com", role: "Editor", initials: "AS", status: "online" },
  { id: "3", name: "Carlos Rodrigues", email: "carlos@xfinance.com", role: "Viewer", initials: "CR", status: "offline" },
  { id: "4", name: "Helena Santos", email: "helena@xfinance.com", role: "Editor", initials: "HS", status: "online" },
  { id: "5", name: "Rafael Lima", email: "rafael@xfinance.com", role: "Viewer", initials: "RL", status: "offline" },
];

const roleConfig = {
  Admin: { icon: Shield, gradient: "from-primary/20 to-primary/5", border: "border-primary/30", text: "text-primary" },
  Editor: { icon: UserCog, gradient: "from-accent/20 to-accent/5", border: "border-accent/30", text: "text-accent" },
  Viewer: { icon: User, gradient: "from-muted-foreground/20 to-muted-foreground/5", border: "border-muted-foreground/30", text: "text-muted-foreground" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function UsersModal({ isOpen, onClose }: UsersModalProps) {
  return (
    <Modal
      id="users-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Gerenciar Usuários"
      subtitle="Gerencie os usuários e permissões do sistema"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="gap-2" data-testid="button-close-users">
            Fechar
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-secondary border-0" data-testid="button-add-user">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </>
      }
    >
      <ScrollArea className="max-h-[400px] custom-scrollbar">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {mockUsers.map((user) => {
            const config = roleConfig[user.role as keyof typeof roleConfig];
            const RoleIcon = config.icon;
            
            return (
              <motion.div
                key={user.id}
                variants={itemVariants}
                className={`flex items-center justify-between p-4 rounded-xl glass border ${config.border} bg-gradient-to-r ${config.gradient} group`}
                data-testid={`user-item-${user.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="border-2 border-white/20">
                      <AvatarFallback className={`bg-gradient-to-br ${config.gradient} ${config.text} text-sm font-bold`}>
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${user.status === "online" ? "bg-success" : "bg-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`gap-1.5 ${config.border} ${config.text}`}>
                    <RoleIcon className="w-3 h-3" />
                    {user.role}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity glass border border-white/10"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </ScrollArea>
    </Modal>
  );
}
