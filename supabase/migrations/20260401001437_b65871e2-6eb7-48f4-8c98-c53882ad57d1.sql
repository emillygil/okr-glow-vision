
-- Allow users to delete their own history entries
CREATE POLICY "Users can delete own kr_history"
ON public.kr_history
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Allow users to update their own history entries
CREATE POLICY "Users can update own kr_history"
ON public.kr_history
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Allow admins to manage all kr_history
CREATE POLICY "Admins can manage all kr_history"
ON public.kr_history
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
