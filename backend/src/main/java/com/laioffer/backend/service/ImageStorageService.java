package com.laioffer.backend.service;

import com.google.cloud.storage.Acl;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.List;
import java.util.UUID;

//created key [22b930aa33284d0d54d5b9b6428d5ccc1587c827] of type [json] as [credentials.json] for [my-service-account@travelplanner-451101.iam.gserviceaccount.com]

@Service
public class ImageStorageService {


    private final String bucketName;
    private final Storage storage;


    public ImageStorageService(@Value("${travelplanner.gcs.bucket}") String bucketName, Storage storage) {
        this.bucketName = bucketName;
        this.storage = storage;
    }


    public String upload(MultipartFile file) {
        String filename = UUID.randomUUID().toString();
        BlobInfo blobInfo;
        try {
            blobInfo = storage.createFrom(
                    BlobInfo
                            .newBuilder(bucketName, filename)
                            .setContentType("image/jpeg")
                            .setAcl(List.of(Acl.of(Acl.User.ofAllUsers(), Acl.Role.READER)))
                            .build(),
                    file.getInputStream());
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to upload file to GCS");
        }
            return "https://storage.googleapis.com/" + blobInfo.getBucket() + "/" + blobInfo.getName();
    }
}
