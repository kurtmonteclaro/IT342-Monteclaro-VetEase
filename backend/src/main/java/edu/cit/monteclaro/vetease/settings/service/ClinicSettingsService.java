package edu.cit.monteclaro.vetease.settings.service;

import edu.cit.monteclaro.vetease.common.BadRequestException;
import edu.cit.monteclaro.vetease.common.ConflictException;
import edu.cit.monteclaro.vetease.common.NotFoundException;
import edu.cit.monteclaro.vetease.settings.dto.BlockedDateDto;
import edu.cit.monteclaro.vetease.settings.dto.ClinicSettingsDto;
import edu.cit.monteclaro.vetease.settings.model.BlockedDate;
import edu.cit.monteclaro.vetease.settings.model.ClinicSettings;
import edu.cit.monteclaro.vetease.settings.repository.BlockedDateRepository;
import edu.cit.monteclaro.vetease.settings.repository.ClinicSettingsRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClinicSettingsService {

    private final ClinicSettingsRepository clinicSettingsRepository;
    private final BlockedDateRepository blockedDateRepository;

    public ClinicSettingsService(ClinicSettingsRepository clinicSettingsRepository, BlockedDateRepository blockedDateRepository) {
        this.clinicSettingsRepository = clinicSettingsRepository;
        this.blockedDateRepository = blockedDateRepository;
    }

    @Transactional(readOnly = true)
    public ClinicSettings getSettingsEntity() {
        return clinicSettingsRepository.findById(1L)
            .orElseThrow(() -> new NotFoundException("Clinic settings not found"));
    }

    @Transactional(readOnly = true)
    public ClinicSettingsDto getSettings() {
        return toDto(getSettingsEntity());
    }

    @Transactional
    public ClinicSettingsDto updateSettings(ClinicSettingsDto request) {
        if (!request.openingTime().isBefore(request.closingTime())) {
            throw new BadRequestException("Opening time must be before closing time");
        }
        if (request.slotMinutes() == null || request.slotMinutes() <= 0) {
            throw new BadRequestException("Slot minutes must be greater than zero");
        }

        ClinicSettings settings = getSettingsEntity();
        settings.setOpeningTime(request.openingTime());
        settings.setClosingTime(request.closingTime());
        settings.setSlotMinutes(request.slotMinutes());
        return toDto(clinicSettingsRepository.save(settings));
    }

    @Transactional(readOnly = true)
    public List<BlockedDateDto> listBlockedDates() {
        return blockedDateRepository.findAllByOrderByDateAsc().stream().map(this::toDto).toList();
    }

    @Transactional
    public BlockedDateDto addBlockedDate(LocalDate date) {
        if (blockedDateRepository.existsByDate(date)) {
            throw new ConflictException("Date is already blocked");
        }
        BlockedDate blockedDate = new BlockedDate();
        blockedDate.setDate(date);
        return toDto(blockedDateRepository.save(blockedDate));
    }

    @Transactional
    public void removeBlockedDate(Long id) {
        if (!blockedDateRepository.existsById(id)) {
            throw new NotFoundException("Blocked date not found");
        }
        blockedDateRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean isBlocked(LocalDate date) {
        return blockedDateRepository.existsByDate(date);
    }

    public ClinicSettingsDto toDto(ClinicSettings settings) {
        return new ClinicSettingsDto(settings.getOpeningTime(), settings.getClosingTime(), settings.getSlotMinutes());
    }

    private BlockedDateDto toDto(BlockedDate blockedDate) {
        return new BlockedDateDto(blockedDate.getId(), blockedDate.getDate());
    }
}
