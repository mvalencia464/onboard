-- Create policies for the "project-files" bucket
-- This bucket is for the bulk photo uploads (25-60 images)

DROP POLICY IF EXISTS "Public Access Projects" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Projects" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Projects" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Projects" ON storage.objects;

CREATE POLICY "Public Access Projects" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
CREATE POLICY "Public Upload Projects" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Public Update Projects" ON storage.objects FOR UPDATE USING (bucket_id = 'project-files');
CREATE POLICY "Public Delete Projects" ON storage.objects FOR DELETE USING (bucket_id = 'project-files');
