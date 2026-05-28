output "zone_id" {
  description = "Cloudflare zone ID"
  value       = cloudflare_zone.main.id
}

output "spa_url" {
  description = "HTTPS URL for the Employee Onboarding Hub SPA"
  value       = "https://${var.spa_hostname}"
}

output "spa_hostname" {
  value = var.spa_hostname
}

output "nameservers" {
  description = "Delegate your registrar to these nameservers after first apply"
  value       = cloudflare_zone.main.name_servers
}
