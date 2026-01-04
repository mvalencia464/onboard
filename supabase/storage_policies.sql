DROP POLICY IF EXISTS "Public Access Logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Logos" ON storage.objects;

CREATE POLICY "Public Access Logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public Upload Logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Public Update Logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');
CREATE POLICY "Public Delete Logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');
