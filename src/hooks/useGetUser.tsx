import { useQuery } from "@tanstack/react-query";
import supabase from "~/services/supabase";

export const useGetUser = () => {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: true,
  });

  return query;
};

export const useGetUserWorkspace = () => {
  const { data: userData } = useGetUser();
  const query = useQuery({
    queryKey: ["user-workspace"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace")
        .select("*")
        .eq("created_by", userData?.user?.id);
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!userData,
  });

  return query;
};
