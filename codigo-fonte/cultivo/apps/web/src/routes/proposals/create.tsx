import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Package, User, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/proposals/create")({
  component: CreateProposalPage,
});

interface Harvest {
  _id: string;
  quantity: number;
  dateOfHarvest: string;
  producer: {
    _id: string;
    name: string;
    email: string;
  } | null;
  group: {
    _id: string;
    name: string;
    createdBy: string;
  } | null;
}

const mockHarvests: Harvest[] = [
  {
    _id: "harvest1",
    quantity: 150,
    dateOfHarvest: "2025-10-15",
    producer: {
      _id: "prod1",
      name: "João Silva",
      email: "joao@example.com",
    },
    group: null,
  },
  {
    _id: "harvest2",
    quantity: 200,
    dateOfHarvest: "2025-10-20",
    producer: null,
    group: {
      _id: "group1",
      name: "Cooperativa do Vale",
      createdBy: "user123",
    },
  },
  {
    _id: "harvest3",
    quantity: 80,
    dateOfHarvest: "2025-11-01",
    producer: {
      _id: "prod2",
      name: "Maria Santos",
      email: "maria@example.com",
    },
    group: null,
  },
  {
    _id: "harvest4",
    quantity: 300,
    dateOfHarvest: "2025-10-25",
    producer: null,
    group: {
      _id: "group2",
      name: "Grupo Sertão",
      createdBy: "user456",
    },
  },
];

function CreateProposalPage() {
  const navigate = useNavigate();
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [valuePerSack, setValuePerSack] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const harvests = mockHarvests;
  const createProposal = useMutation(api.proposals.createProposal);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user._id || "");
    }
  }, []);

  const handleSelectHarvest = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setQuantity("");
    setValuePerSack("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHarvest) {
      toast.error("Selecione uma colheita");
      return;
    }

    const quantityNum = Number.parseInt(quantity);
    const valueNum = Number.parseFloat(valuePerSack);

    if (!quantityNum || quantityNum <= 0) {
      toast.error("Informe uma quantidade válida");
      return;
    }

    if (quantityNum > selectedHarvest.quantity) {
      toast.error(`A quantidade não pode ser maior que ${selectedHarvest.quantity} sacas disponíveis`);
      return;
    }

    if (!valueNum || valueNum <= 0) {
      toast.error("Informe um valor por saca válido");
      return;
    }

    if (!currentUserId) {
      toast.error("Usuário não identificado");
      return;
    }

    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      await createProposal({
        groupId: selectedHarvest.group?._id as any,
        userId: selectedHarvest.group ? undefined : (selectedHarvest.producer?._id as any),
        valuePerSack: valueNum,
        quantity: quantityNum,
        phoneBuyer: user?.telefone || "",
        emailBuyer: user?.email || "",
        nameBuyer: user?.name || "Representante",
        buyerId: currentUserId as any,
      });

      toast.success("Proposta enviada com sucesso!");
      navigate({ to: "/proposals" });
    } catch (error) {
      toast.error("Erro ao enviar proposta");
      console.error(error);
    }
  };
