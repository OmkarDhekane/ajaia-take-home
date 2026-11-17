CREATE TABLE `document_shares` (
	`documentId` text NOT NULL,
	`recipientId` text NOT NULL,
	`createdAt` integer NOT NULL,
	PRIMARY KEY(`documentId`, `recipientId`),
	FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `document_shares_recipient_idx` ON `document_shares` (`recipientId`);